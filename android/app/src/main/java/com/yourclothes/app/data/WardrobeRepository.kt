package com.yourclothes.app.data

import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

@Serializable
data class WardrobeItem(
    val id: String? = null,
    val user_id: String,
    val image_url: String,
    val category: String,
    val color: String? = null,
    val style: String? = null,
    val fabric: String? = null,
    val laundry_status: String = "clean",
    val times_worn: Int = 0
)

class WardrobeRepository {
    private val client = SupabaseClient.client

    suspend fun getItems(userId: String): List<WardrobeItem> = withContext(Dispatchers.IO) {
        client.postgrest["wardrobe_items"]
            .select {
                filter {
                    eq("user_id", userId)
                }
            }
            .decodeList()
    }

    suspend fun uploadPhoto(fileName: String, byteArray: ByteArray, mimeType: String = "image/jpeg"): String = withContext(Dispatchers.IO) {
        val bucket = client.storage["wardrobe-photos"]
        
        // Upload with proper MIME type to ensure no compression
        bucket.upload(
            path = fileName,
            data = byteArray,
            upsert = false
        ) {
            // Configure upload options to preserve original quality
            contentType = mimeType
        }
        
        bucket.publicUrl(fileName)
    }

    suspend fun addItem(item: WardrobeItem) = withContext(Dispatchers.IO) {
        client.postgrest["wardrobe_items"].insert(item)
    }

    suspend fun updateLaundryStatus(id: String, status: String) = withContext(Dispatchers.IO) {
        client.postgrest["wardrobe_items"].update({
            set("laundry_status", status)
        }) {
            filter { eq("id", id) }
        }
    }

    suspend fun getItemsByCategory(userId: String): Map<String, List<WardrobeItem>> = withContext(Dispatchers.IO) {
        val allItems = getItems(userId)
        allItems.groupBy { it.category }
    }
}
