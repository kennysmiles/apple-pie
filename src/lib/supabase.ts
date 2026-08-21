import { createClient } from '@supabase/supabase-js';
import { compressImage } from '../utils/helpers';

const meta = import.meta as any;
const win = typeof window !== 'undefined' ? (window as any) : {};
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL configured:ok', !!supabaseUrl);
console.log('Supabase key configured:ok', !!supabaseAnonKey);

const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url === 'your_supabase_project_url' || url.includes('your_')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}; 

console.log('Supabase URL configured:okay', !!supabaseUrl);
console.log('Supabase key configured:okay', !!supabaseAnonKey);



// Only initialize if valid environment variables are provided to avoid runtime crashes
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * Tries multiple common buckets (birthday-memories, avatars, public, images).
 * Falls back safely to compressed image data URL if storage buckets are not available.
 */
export async function uploadImageToSupabase(file: File, preferredBucket: string = 'birthday-memories'): Promise<string> {
  console.info(`[Supabase Storage Debug] Starting image upload for file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);

  if (supabase) {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const bucketsToTry = Array.from(new Set([preferredBucket, 'birthday-memories', 'avatars', 'public', 'images']));

    for (const bName of bucketsToTry) {
      try {
        console.info(`[Supabase Storage Debug] Attempting upload to bucket "${bName}"...`);
        const { data, error } = await supabase.storage
          .from(bName)
          .upload(cleanFileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(bName)
            .getPublicUrl(cleanFileName);

          if (publicUrlData?.publicUrl) {
            console.info(`[Supabase Storage Debug] Upload succeeded on bucket "${bName}":`, publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
          }
        } else if (error) {
          console.warn(`[Supabase Storage Debug] Bucket "${bName}" upload failed:`, error.message);
        }
      } catch (e: any) {
        console.warn(`[Supabase Storage Debug] Bucket "${bName}" error:`, e?.message || e);
      }
    }
  } else {
    console.warn('[Supabase Storage Debug] Supabase client is not initialized or invalid credentials.');
  }

  console.info('[Supabase Storage Debug] Falling back to local high-performance base64 image compression.');
  try {
    const base64 = await compressImage(file);
    console.info(`[Supabase Storage Debug] Local compression generated ${Math.round(base64.length / 1024)} KB image payload.`);
    return base64;
  } catch (err: any) {
    console.error('[Supabase Storage Debug Error] Compression failed:', err);
    throw new Error(`Image processing failed: ${err.message || err}`);
  }
}

/**
 * Saves a card config link directly to Supabase table `wishly_cards`.
 * Falls back gracefully.
 */
export async function saveCardToSupabase(card: { id: string; name: string; url: string; recipient: string }): Promise<boolean> {
  if (!supabase) return false;

  try {
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch (e) {
      // ignore auth fetch network error
    }
    if (!user) return false;

    const { error } = await supabase
      .from('wishly_cards')
      .upsert({
        id: card.id,
        user_id: user.id,
        name: card.name,
        url: card.url,
        recipient: card.recipient,
        created_at: new Date().toISOString()
      });

    if (error) return false;
    return true;
  } catch (err) {
    console.warn('Failed to save card to cloud:', err);
    return false;
  }
}

/**
 * Fetches all saved cards from Supabase cloud under the current logged-in user.
 */
export async function fetchCardsFromSupabase(): Promise<Array<{ id: string; name: string; url: string; recipient: string; created_at:number; }> | null> {
  if (!supabase) return null;

  try {
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch (e) {
      // ignore auth fetch network error
    }
    if (!user) return null;

    const { data, error } = await supabase
      .from('wishly_cards')
      .select('id, name, url, recipient')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return null;
    return data as Array<{ id: string; name: string; url: string; recipient: string; created_at: number }>;
  } catch (err) {
    console.warn('Failed to fetch cards from cloud:', err);
    return null;
  }
}

/**
 * Saves user profile directly to Supabase `users` table and Auth metadata.
 * Gracefully retries without optional `updated_at` column if it is missing in DB.
 */
export async function saveUserProfileToSupabase(userId: string, profile: { fullName: string; username?: string; avatarUrl: string; dateOfBirth: string }): Promise<boolean> {
  console.info('[Supabase Profile Debug] Syncing profile to cloud for user ID:', userId, profile);

  if (!supabase) {
    console.warn('[Supabase Profile Debug] Supabase client is not configured. Saved locally.');
    return false;
  }

  let authMetaSynced = false;

  try {
    // Get logged-in user email to satisfy NOT NULL constraint on users.email if inserting
    let userEmail: string | undefined;
    try {
      const { data: authData } = await supabase.auth.getUser();
      userEmail = authData?.user?.email;
    } catch (e) {}

    // 1. Sync to Supabase Auth user_metadata so profile is preserved across logins
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          name: profile.fullName,
          username: profile.username || '',
          avatar_url: profile.avatarUrl,
          date_of_birth: profile.dateOfBirth
        }
      });
      if (authErr) {
        console.warn('[Supabase Profile Debug] Auth metadata update notice:', authErr.message);
      } else {
        console.info('[Supabase Profile Debug] Auth metadata updated successfully.');
        authMetaSynced = true;
      }
    } catch (authErr: any) {
      console.warn('[Supabase Profile Debug] Auth metadata update exception:', authErr?.message || authErr);
    }

    // 2. Try 'users' table update first (doesn't fail if email isn't supplied for existing rows)
    const baseFields: Record<string, any> = {
      full_name: profile.fullName,
      username: profile.username || '',
      avatar_url: profile.avatarUrl,
      date_of_birth: profile.dateOfBirth
    };

    try {
      // First try update on existing row with updated_at
      let { error: updateErr, count } = await supabase
        .from('users')
        .update({ ...baseFields, updated_at: new Date().toISOString() }, { count: 'exact' })
        .eq('id', userId);

      if (updateErr && updateErr.message.includes("updated_at")) {
        // Retry update without updated_at
        const res = await supabase
          .from('users')
          .update(baseFields, { count: 'exact' })
          .eq('id', userId);
        updateErr = res.error;
        count = res.count;
      }

      if (!updateErr && count && count > 0) {
        console.info('[Supabase Profile Debug] Updated profile in "users" table.');
        return true;
      }

      // 3. If row doesn't exist yet or update didn't match, do upsert including email & id
      const upsertPayload: Record<string, any> = {
        id: userId,
        ...baseFields,
      };
      if (userEmail) {
        upsertPayload.email = userEmail;
      }

      // Try upsert with updated_at
      let { error: upsertErr } = await supabase
        .from('users')
        .upsert({ ...upsertPayload, updated_at: new Date().toISOString() });

      if (upsertErr && upsertErr.message.includes("updated_at")) {
        // Retry upsert without updated_at
        const res = await supabase
          .from('users')
          .upsert(upsertPayload);
        upsertErr = res.error;
      }

      if (!upsertErr) {
        console.info('[Supabase Profile Debug] Upserted profile in "users" table.');
        return true;
      } else {
        console.warn('[Supabase Profile Debug] "users" table upsert notice:', upsertErr.message);
      }
    } catch (uErr: any) {
      console.warn('[Supabase Profile Debug] "users" table exception:', uErr?.message || uErr);
    }

    if (authMetaSynced) {
      console.info('[Supabase Profile Debug] Profile sync completed via Supabase Auth metadata.');
      return true;
    }

    console.warn('[Supabase Profile Debug] Cloud database table sync skipped. Profile persisted in local storage.');
    return false;
  } catch (err: any) {
    console.error('[Supabase Profile Debug Error] Failed profile save operation:', err);
    throw err;
  }
}

/**
 * Fetches user profile directly from Supabase `users` table or Auth user_metadata.
 */
export async function fetchUserProfileFromSupabase(userId: string): Promise<{ fullName: string; username: string; avatarUrl: string; dateOfBirth: string } | null> {
  if (!supabase) return null;

  try {
    // 1. Try 'users' table
    try {
      let { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if ((userErr || !userData) && userId) {
        const { data: fbData, error: fbErr } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (!fbErr && fbData) userData = fbData;
      }

      if (userData) {
        const fullName = userData.full_name || userData.fullName || userData.name || userData.display_name || (userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : '');
        if (fullName || userData.username || userData.date_of_birth) {
          return {
            fullName: fullName || '',
            username: userData.username || userData.user_name || userData.handle || '',
            avatarUrl: userData.avatar_url || userData.avatarUrl || userData.avatar || userData.picture || '🎂',
            dateOfBirth: userData.date_of_birth || userData.dateOfBirth || userData.dob || userData.birth_date || ''
          };
        }
      }
    } catch (e) {}

    // 2. Try reading from Auth User Metadata
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const meta = authData.user.user_metadata || {};
        const fullName = meta.full_name || meta.name || meta.fullName || meta.display_name || '';
        if (fullName || meta.username || meta.date_of_birth) {
          return {
            fullName: fullName || '',
            username: meta.username || meta.preferred_username || meta.user_name || '',
            avatarUrl: meta.avatar_url || meta.picture || meta.avatar || '🎂',
            dateOfBirth: meta.date_of_birth || meta.dob || meta.dateOfBirth || ''
          };
        }
      }
    } catch (e) {}

    return null;
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
    return null;
  }
}

function safeJsonParse(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch (e) { return fallback; }
}

/**
 * Saves wishlists array for a user in Supabase `wishlists` & `wishlist_items` tables, as well as auth metadata.
 * Supports both multi-table relational schemas (wishlists + wishlist_items) and single-table / aggregate schemas.
 * Includes standard error logs and diagnostic messages for debugging insertion failures.
 */
export async function saveWishlistsToSupabase(userId: string, wishlists: any[]): Promise<boolean> {
  console.info(`[Supabase Wishlists Debug] Starting save operations for ${wishlists.length} wishlist(s) (User ID: "${userId}")`, wishlists);

  if (!supabase) {
    console.warn('[Supabase Wishlists Debug] Supabase client is not initialized or configured.');
    return false;
  }

  // Always back up wishlists in Supabase auth user metadata
  try {
    const { error: authErr } = await supabase.auth.updateUser({
      data: { wishlists }
    });
    if (authErr) {
      console.warn('[Supabase Wishlists Debug] Auth metadata update notice:', authErr.message);
    } else {
      console.info('[Supabase Wishlists Debug] Auth user metadata updated with wishlists backup.');
    }
  } catch (authErr: any) {
    console.warn('[Supabase Wishlists Debug] Auth metadata update exception:', authErr?.message || authErr);
  }

  const wishlistTableCandidates = ['wishlists'];
  const itemTableCandidates = ['wishlist_items'];
  let lastError: any = null;

  for (const tableName of wishlistTableCandidates) {
    try {
      console.info(`[Supabase Wishlists Debug] Attempting save to wishlist table candidate "${tableName}"...`);
      let wishlistSuccessCount = 0;

      for (const wl of wishlists) {
        const itemsJson = wl.items || [];
        const itemsString = JSON.stringify(itemsJson);
        const numId = !isNaN(Number(wl.id)) ? Number(wl.id) : null;

        // 1. Main wishlist payload variations
        const mainPayloadsToTry: Record<string, any>[] = [
          // Standard schema: string id, user_id, title, description, target_date
          {
            id: String(wl.id),
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || ''
          },
          // Standard schema with updated_at
          {
            id: String(wl.id),
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || '',
            updated_at: new Date().toISOString()
          },
          // Omit 'id' in case id is UUID or SERIAL auto-generated in Postgres
          {
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || ''
          },
          // Numeric id if valid
          ...(numId ? [{
            id: numId,
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || ''
          }] : []),
          // Single-table embedded items column fallbacks
          {
            id: String(wl.id),
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || '',
            items: itemsJson
          },
          {
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || '',
            items: itemsJson
          },
          {
            id: String(wl.id),
            user_id: userId,
            title: wl.title || '',
            description: wl.description || '',
            target_date: wl.targetDate || '',
            items: itemsString
          }
        ];

        let wlSaved = false;
        for (const payload of mainPayloadsToTry) {
          const { error } = await (supabase.from(tableName as any) as any).upsert(payload as any);
          if (!error) {
            wlSaved = true;
            console.info(`[Supabase Wishlists Debug] Wishlist "${wl.title}" (ID: ${wl.id}) saved to "${tableName}".`);
            break;
          } else {
            lastError = error;
            console.warn(`[Supabase Wishlists Debug] Notice on "${tableName}" payload:`, error.message, error);
          }
        }

        if (wlSaved) {
          wishlistSuccessCount++;
        } else {
          console.error(`[Supabase Wishlists Debug Error] Could not insert wishlist "${wl.title}" into table "${tableName}".`, lastError);
        }

        // 2. Upsert into wishlist_items table
        if (Array.isArray(wl.items) && wl.items.length > 0) {
          for (const itemCandidate of itemTableCandidates) {
            try {
              let savedItemCount = 0;
              for (const item of wl.items) {
                const itemNumId = !isNaN(Number(item.id)) ? Number(item.id) : null;
                const itemPayloads: Record<string, any>[] = [
                  // Exact user schema
                  {
                    id: String(item.id),
                    wishlist_id: String(wl.id),
                    title: item.title || item.name || '',
                    price: item.price || '',
                    link: item.url || item.link || '',
                    image_url: item.image || item.imageUrl || '',
                    priority: item.priority || 'medium',
                    is_claimed: Boolean(item.claimed || item.isClaimed),
                    claimed_by: item.claimedBy || null
                  },
                  // Omit item id (if UUID/auto-increment)
                  {
                    wishlist_id: String(wl.id),
                    title: item.title || item.name || '',
                    price: item.price || '',
                    link: item.url || item.link || '',
                    image_url: item.image || item.imageUrl || '',
                    priority: item.priority || 'medium',
                    is_claimed: Boolean(item.claimed || item.isClaimed),
                    claimed_by: item.claimedBy || null
                  },
                  // Numeric id & wishlist_id if valid
                  ...(itemNumId && numId ? [{
                    id: itemNumId,
                    wishlist_id: numId,
                    title: item.title || item.name || '',
                    price: item.price || '',
                    link: item.url || item.link || '',
                    image_url: item.image || item.imageUrl || '',
                    priority: item.priority || 'medium',
                    is_claimed: Boolean(item.claimed || item.isClaimed),
                    claimed_by: item.claimedBy || null
                  }] : []),
                  // Alternative column name fallbacks
                  {
                    id: String(item.id),
                    wishlist_id: String(wl.id),
                    title: item.title || item.name || '',
                    price: item.price || '',
                    url: item.url || item.link || '',
                    image: item.image || item.imageUrl || '',
                    priority: item.priority || 'medium',
                    claimed: Boolean(item.claimed || item.isClaimed),
                    claimed_by: item.claimedBy || null
                  }
                ];

                let itemSaved = false;
                for (const itemPayload of itemPayloads) {
                  const { error: itemErr } = await (supabase.from(itemCandidate as any) as any).upsert(itemPayload as any);
                  if (!itemErr) {
                    itemSaved = true;
                    savedItemCount++;
                    break;
                  } else {
                    console.warn(`[Supabase Wishlists Debug] Notice on item table "${itemCandidate}":`, itemErr.message);
                  }
                }
                if (!itemSaved) {
                  console.warn(`[Supabase Wishlists Debug] Item "${item.title}" could not be inserted into "${itemCandidate}".`);
                }
              }
              if (savedItemCount > 0) {
                console.info(`[Supabase Wishlists Debug] Saved ${savedItemCount} item(s) to "${itemCandidate}".`);
                break;
              }
            } catch (itemTableErr: any) {
              console.warn(`[Supabase Wishlists Debug] Exception in item table "${itemCandidate}":`, itemTableErr?.message || itemTableErr);
            }
          }
        }
      }

      if (wishlists.length === 0) {
        console.info(`[Supabase Wishlists Debug] Wishlists list is empty. Clearing wishlist records for user "${userId}".`);
        for (const tableName of wishlistTableCandidates) {
          try {
            await (supabase.from(tableName as any) as any).delete().eq('user_id', userId);
          } catch (e) {}
        }
        return true;
      }

      if (wishlistSuccessCount > 0) {
        console.info(`[Supabase Wishlists Debug] Wishlist save completed successfully on table "${tableName}".`);
        return true;
      }

      // 3. Aggregate column fallbacks (data, content, payload, wishlists)
      console.info(`[Supabase Wishlists Debug] Trying aggregate payload columns on "${tableName}"...`);
      const aggPayloads = [
        { user_id: userId, data: wishlists, updated_at: new Date().toISOString() },
        { user_id: userId, content: wishlists, updated_at: new Date().toISOString() },
        { user_id: userId, payload: wishlists, updated_at: new Date().toISOString() },
        { user_id: userId, wishlists: wishlists, updated_at: new Date().toISOString() }
      ];

      for (const agg of aggPayloads) {
        const { error } = await (supabase.from(tableName as any) as any).upsert(agg as any);
        if (!error) {
          console.info(`[Supabase Wishlists Debug] Wishlist saved using aggregate column on table "${tableName}".`);
          return true;
        } else {
          lastError = error;
          console.warn(`[Supabase Wishlists Debug] Aggregate payload notice on "${tableName}":`, error.message);
        }
      }
    } catch (e: any) {
      console.warn(`[Supabase Wishlists Debug] Exception on table "${tableName}":`, e?.message || e);
    }
  }

  console.error('[Supabase Wishlists Debug Error] Failed to insert/upsert wishlist data into cloud database. Details:', lastError?.message || lastError);
  return false;
}

/**
 * Deletes an entire wishlist from Supabase DB tables, auth metadata, and local storage.
 */
export async function deleteWishlistFromSupabase(userId: string, wishlistId: string, remainingWishlists: any[]): Promise<boolean> {
  console.info(`[Supabase Wishlists Debug] Deleting wishlist ID "${wishlistId}" for User ID "${userId}"`);

  try {
    localStorage.setItem('wishly_user_wishlists', JSON.stringify(remainingWishlists));
  } catch (e) {}

  if (!supabase) return false;

  // 1. Update Auth Metadata
  try {
    await supabase.auth.updateUser({
      data: { wishlists: remainingWishlists }
    });
  } catch (e: any) {
    console.warn('[Supabase Wishlists Debug] Auth metadata update on delete notice:', e?.message || e);
  }

  // 2. Delete items from wishlist_items
  const itemTables = ['wishlist_items'];
  for (const table of itemTables) {
    try {
      await (supabase.from(table as any) as any).delete().eq('wishlist_id', String(wishlistId));
      if (!isNaN(Number(wishlistId))) {
        await (supabase.from(table as any) as any).delete().eq('wishlist_id', Number(wishlistId));
      }
    } catch (e: any) {
      console.warn(`[Supabase Wishlists Debug] Item deletion notice on "${table}":`, e?.message || e);
    }
  }

  // 3. Delete wishlist from wishlists
  const wlTables = ['wishlists'];
  for (const table of wlTables) {
    try {
      await (supabase.from(table as any) as any).delete().eq('id', String(wishlistId)).eq('user_id', userId);
      if (!isNaN(Number(wishlistId))) {
        await (supabase.from(table as any) as any).delete().eq('id', Number(wishlistId)).eq('user_id', userId);
      }
    } catch (e: any) {
      console.warn(`[Supabase Wishlists Debug] Wishlist table deletion notice on "${table}":`, e?.message || e);
    }
  }

  // 4. Update aggregate column if present
  if (remainingWishlists.length > 0) {
    for (const table of wlTables) {
      const aggPayloads = [
        { user_id: userId, data: remainingWishlists, updated_at: new Date().toISOString() },
        { user_id: userId, content: remainingWishlists, updated_at: new Date().toISOString() },
        { user_id: userId, payload: remainingWishlists, updated_at: new Date().toISOString() },
        { user_id: userId, wishlists: remainingWishlists, updated_at: new Date().toISOString() }
      ];
      for (const agg of aggPayloads) {
        try {
          await (supabase.from(table as any) as any).upsert(agg as any);
        } catch (e) {}
      }
    }
  } else {
    for (const table of wlTables) {
      try {
        await (supabase.from(table as any) as any).delete().eq('user_id', userId);
      } catch (e) {}
    }
  }

  return true;
}

/**
 * Deletes a specific item from a wishlist in Supabase DB tables, auth metadata, and local storage.
 */
export async function deleteWishlistItemFromSupabase(userId: string, wishlistId: string, itemId: string, remainingWishlists: any[]): Promise<boolean> {
  console.info(`[Supabase Wishlists Debug] Deleting item ID "${itemId}" from wishlist "${wishlistId}" for User ID "${userId}"`);

  try {
    localStorage.setItem('wishly_user_wishlists', JSON.stringify(remainingWishlists));
  } catch (e) {}

  if (!supabase) return false;

  // 1. Update Auth Metadata
  try {
    await supabase.auth.updateUser({
      data: { wishlists: remainingWishlists }
    });
  } catch (e: any) {
    console.warn('[Supabase Wishlists Debug] Auth metadata update on item delete notice:', e?.message || e);
  }

  // 2. Delete item from wishlist_items
  const itemTables = ['wishlist_items'];
  for (const table of itemTables) {
    try {
      await (supabase.from(table as any) as any).delete().eq('id', String(itemId));
      if (!isNaN(Number(itemId))) {
        await (supabase.from(table as any) as any).delete().eq('id', Number(itemId));
      }
    } catch (e: any) {
      console.warn(`[Supabase Wishlists Debug] Item table deletion notice on "${table}":`, e?.message || e);
    }
  }

  // 3. Re-sync updated wishlist to main table
  await saveWishlistsToSupabase(userId, remainingWishlists);

  return true;
}

/**
 * Fetches user wishlists from Supabase `wishlists` & `wishlist_items` tables or auth metadata fallback.
 * Seamlessly joins items from `wishlist_items` or parses embedded item columns.
 */
export async function fetchWishlistsFromSupabase(userId: string): Promise<any[] | null> {
  console.info('[Supabase Wishlists Debug] Fetching wishlists for user ID:', userId);
  if (!supabase) return null;

  const wishlistTableCandidates = ['wishlists'];
  const itemTableCandidates = ['wishlist_items'];

  for (const tableName of wishlistTableCandidates) {
    try {
      let rows: any[] | null = null;
      let { data: resData, error: resErr } = await (supabase.from(tableName as any) as any)
        .select('*')
        .eq('user_id', userId);

      if (!resErr && resData && resData.length > 0) {
        rows = resData;
      } else if (resErr) {
        console.warn(`[Supabase Wishlists Debug] Fetch notice on "${tableName}" (user_id):`, resErr.message);
      }

      if (rows && rows.length > 0) {
        const first = rows[0];

        // Check if table uses aggregate column
        for (const col of ['data', 'content', 'payload', 'wishlists']) {
          if (first && first[col]) {
            const parsed = safeJsonParse(first[col], null);
            if (Array.isArray(parsed)) return parsed;
          }
        }

        // Map individual wishlist rows
        const mappedWishlists = await Promise.all(
          rows.map(async (row: any) => {
            const wishlistId = String(row.id || row.wishlist_id || Date.now());
            let items: any[] = [];

            // 1. Check if items are embedded directly on the row
            if (Array.isArray(row.items) && row.items.length > 0) {
              items = row.items;
            } else if (typeof row.items === 'string' && row.items.trim().length > 0) {
              items = safeJsonParse(row.items, []);
            }

            // 2. Query `wishlist_items` or `wishlist_item` table for items
            if (items.length === 0) {
              for (const itemCandidate of itemTableCandidates) {
                try {
                  let { data: itemRows, error: itemErr } = await (supabase.from(itemCandidate as any) as any)
                    .select('*')
                    .eq('wishlist_id', wishlistId);

                  if (itemRows && itemRows.length > 0) {
                    items = itemRows;
                    break;
                  }
                } catch (e) {
                  // try next item table candidate
                }
              }
            }

            // Normalize all item properties so fields like title, link, imageUrl, isClaimed match TypeScript types
            const normalizedItems = items.map((i: any, itemIdx: number) => ({
              id: String(i.id || `item-${itemIdx}`),
              title: i.title || i.name || i.item_name || 'Wish Item',
              price: i.price !== undefined && i.price !== null ? String(i.price) : '',
              link: i.link || i.url || i.item_url || '',
              imageUrl: i.imageUrl || i.image_url || i.image || i.img || '🎁',
              priority: (i.priority === 'high' || i.priority === 'low' || i.priority === 'medium') ? i.priority : 'medium',
              isClaimed: Boolean(i.is_claimed ?? i.claimed ?? i.isClaimed),
              claimedBy: i.claimed_by || i.claimedBy || i.claimerName || ''
            }));

            return {
              id: wishlistId,
              title: row.title || row.name || 'Wishlist',
              description: row.description || row.desc || '',
              targetDate: row.target_date || row.targetDate || row.date || '',
              theme: row.theme || 'midnight',
              creatorName: row.creator_name || row.creatorName || '',
              creatorUsername: row.creator_username || row.creatorUsername || '',
              creatorAvatar: row.creator_avatar || row.creatorAvatar || '🎂',
              creatorDob: row.creator_dob || row.creatorDob || '',
              items: normalizedItems
            };
          })
        );

        return mappedWishlists;
      }
    } catch (tableErr) {
      // try next table
    }
  }

  // Fallback: Check Auth Metadata
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.user_metadata?.wishlists && Array.isArray(authData.user.user_metadata.wishlists)) {
      return authData.user.user_metadata.wishlists;
    }
  } catch (authMetaErr) {
    // ignore auth metadata network error
  }

  return null;
}

/**
 * Fetches all items for a given wishlist directly from Supabase `wishlist_items` table.
 * Supports string ID, numeric ID, and standard field normalization.
 */
export async function fetchWishlistItemsFromSupabase(wishlistId: string | number): Promise<any[]> {
  if (!supabase || !wishlistId) return [];

  const itemTableCandidates = ['wishlist_items', 'wishlist_item', 'items'];
  const stringId = String(wishlistId);
  const numId = !isNaN(Number(wishlistId)) ? Number(wishlistId) : null;

  for (const tableName of itemTableCandidates) {
    try {
      // 1. Try querying by string wishlist_id
      let { data: items } = await (supabase.from(tableName as any) as any)
        .select('*')
        .eq('wishlist_id', stringId);

      // 2. If no results, try querying by numeric wishlist_id
      if ((!items || items.length === 0) && numId !== null) {
        const { data: numItems } = await (supabase.from(tableName as any) as any)
          .select('*')
          .eq('wishlist_id', numId);
        if (numItems && numItems.length > 0) {
          items = numItems;
        }
      }

      if (items && items.length > 0) {
        return items.map((i: any, itemIdx: number) => ({
          id: String(i.id || `item-${itemIdx}`),
          title: i.title || i.name || i.item_name || 'Wish Item',
          price: i.price !== undefined && i.price !== null ? String(i.price) : '',
          link: i.link || i.url || i.item_url || '',
          imageUrl: i.imageUrl || i.image_url || i.image || i.img || '🎁',
          priority: (i.priority === 'high' || i.priority === 'low' || i.priority === 'medium') ? i.priority : 'medium',
          isClaimed: Boolean(i.is_claimed ?? i.claimed ?? i.isClaimed),
          claimedBy: i.claimed_by || i.claimedBy || i.claimerName || ''
        }));
      }
    } catch (err) {
      console.warn(`[Supabase Wishlist Items] Error querying ${tableName}:`, err);
    }
  }

  return [];
}

/**
 * Saves friends list for a user to Supabase Auth User Metadata and local storage.
 */
export async function saveFriendsToSupabase(userId: string, friends: any[]): Promise<boolean> {
  console.info(`[Supabase Friends Debug] Syncing ${friends.length} friend(s) for user ID: "${userId}"`);
  try {
    localStorage.setItem('wishly_user_friends', JSON.stringify(friends));
  } catch (e) {}

  if (!supabase) return false;

  try {
    const { error } = await supabase.auth.updateUser({
      data: { friends }
    });

    if (error) {
      console.warn('[Supabase Friends Debug] Auth metadata update notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Friends Debug] Exception saving friends:', err);
    return false;
  }
}

/**
 * Fetches friends list for a user from Supabase Auth User Metadata or local storage.
 */
export async function fetchFriendsFromSupabase(userId: string): Promise<any[] | null> {
  if (!supabase) {
    try {
      const saved = localStorage.getItem('wishly_user_friends');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.user_metadata?.friends && Array.isArray(authData.user.user_metadata.friends)) {
      const cloudFriends = authData.user.user_metadata.friends;
      try {
        localStorage.setItem('wishly_user_friends', JSON.stringify(cloudFriends));
      } catch (e) {}
      return cloudFriends;
    }
  } catch (e) {}

  try {
    const saved = localStorage.getItem('wishly_user_friends');
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return null;
}

/**
 * Searches registered users in Supabase `users` or `profiles` table by username or full_name.
 */
export async function searchUsersInSupabase(query: string, currentUserId?: string): Promise<Array<{ id: string; fullName: string; username: string; avatarUrl: string; dateOfBirth: string; isRealUser?: boolean }> | null> {
  if (!supabase || !query.trim()) return [];

  const cleanQuery = query.trim().replace(/^@/, '');
  console.info(`[Supabase Search Debug] Executing DB search for term: "${cleanQuery}"`);

  try {
    // 1. Query 'users' table with standard column names
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, date_of_birth')
      .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
      .limit(15);

    if (error) {
      console.warn('[Supabase Search Debug] "users" table query error:', error.message);
    } else if (data && data.length > 0) {
      console.info(`[Supabase Search Debug] Found ${data.length} user(s) in "users" table.`);
      return data
        .filter((u: any) => u.id !== currentUserId)
        .map((u: any) => ({
          id: String(u.id || Math.random().toString()),
          fullName: u.full_name || u.username || 'User',
          username: u.username || (u.full_name ? u.full_name.toLowerCase().replace(/\s+/g, '') : 'user'),
          avatarUrl: u.avatar_url || '🎂',
          dateOfBirth: u.date_of_birth || '',
          isRealUser: true
        }));
    }

    // 2. Query 'profiles' table as secondary fallback if 'users' table returned no matches
    const { data: profData, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, date_of_birth')
      .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
      .limit(15);

    if (!profError && profData && profData.length > 0) {
      console.info(`[Supabase Search Debug] Found ${profData.length} user(s) in "profiles" table.`);
      return profData
        .filter((u: any) => u.id !== currentUserId)
        .map((u: any) => ({
          id: String(u.id || Math.random().toString()),
          fullName: u.full_name || u.username || 'User',
          username: u.username || (u.full_name ? u.full_name.toLowerCase().replace(/\s+/g, '') : 'user'),
          avatarUrl: u.avatar_url || '🎂',
          dateOfBirth: u.date_of_birth || '',
          isRealUser: true
        }));
    }
  } catch (err: any) {
    console.warn('[Supabase Search Debug] Exception during user search:', err?.message || err);
  }

  return [];
}


