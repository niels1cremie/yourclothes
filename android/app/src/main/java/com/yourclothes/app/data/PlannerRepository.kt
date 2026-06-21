package com.yourclothes.app.data

import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Serializable
data class PlannedOutfit(
    val id: String? = null,
    val user_id: String,
    val date: String,
    val occasion: String? = null,
    val items: List<WardrobeItem> = emptyList(),
    val notes: String? = null,
    val weather_condition: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null
)

@Serializable
data class OccasionTemplate(
    val id: String? = null,
    val name: String,
    val description: String? = null,
    val suggested_categories: List<String> = emptyList()
)

class PlannerRepository {
    private val client = SupabaseClient.client
    private val dateFormatter = DateTimeFormatter.ISO_DATE

    suspend fun getPlannedOutfits(userId: String, date: String): PlannedOutfit? = withContext(Dispatchers.IO) {
        try {
            client.postgrest["planned_outfits"]
                .select {
                    filter {
                        eq("user_id", userId)
                        eq("date", date)
                    }
                }
                .decodeSingleOrNull<PlannedOutfit>()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getPlannedOutfitsForWeek(userId: String, startDate: LocalDate): List<PlannedOutfit> = withContext(Dispatchers.IO) {
        try {
            val endDate = startDate.plusDays(6)
            client.postgrest["planned_outfits"]
                .select {
                    filter {
                        eq("user_id", userId)
                        gte("date", startDate.format(dateFormatter))
                        lte("date", endDate.format(dateFormatter))
                    }
                    order("date", order = io.github.jan.supabase.postgrest.Order.ASCENDING)
                }
                .decodeList<PlannedOutfit>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun createPlannedOutfit(outfit: PlannedOutfit): PlannedOutfit? = withContext(Dispatchers.IO) {
        try {
            val result = client.postgrest["planned_outfits"]
                .insert(outfit) {
                    select()
                }
                .decodeSingleOrNull<PlannedOutfit>()
            result
        } catch (e: Exception) {
            null
        }
    }

    suspend fun updatePlannedOutfit(outfit: PlannedOutfit): PlannedOutfit? = withContext(Dispatchers.IO) {
        try {
            val result = client.postgrest["planned_outfits"]
                .update(outfit) {
                    filter {
                        eq("id", outfit.id)
                    }
                    select()
                }
                .decodeSingleOrNull<PlannedOutfit>()
            result
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deletePlannedOutfit(outfitId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            client.postgrest["planned_outfits"]
                .delete {
                    filter {
                        eq("id", outfitId)
                    }
                }
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getOccasionTemplates(): List<OccasionTemplate> = withContext(Dispatchers.IO) {
        try {
            // Default templates if table doesn't exist yet
            listOf(
                OccasionTemplate(
                    id = "1",
                    name = "Casual",
                    description = "Alledaags, comfortabele kleding",
                    suggested_categories = listOf("T-shirts", "Jeans", "Sneakers")
                ),
                OccasionTemplate(
                    id = "2", 
                    name = "Business",
                    description = "Professionele kleding voor werk",
                    suggested_categories = listOf("Overhemden", "Broeken", "Pakken")
                ),
                OccasionTemplate(
                    id = "3",
                    name = "Formeel",
                    description = "Chique kleding voor speciale gelegenheden",
                    suggested_categories = listOf("Pakken", "Kostuums", "Formele schoenen")
                ),
                OccasionTemplate(
                    id = "4",
                    name = "Sport",
                    description = "Sportieve kleding",
                    suggested_categories = listOf("Sportshirts", "Sportbroeken", "Sportschoenen")
                ),
                OccasionTemplate(
                    id = "5",
                    name = "Feest",
                    description = "Feestelijke kleding",
                    suggested_categories = listOf("Feestkleding", "Accessoires", "Schoenen")
                )
            )
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun getWeatherOutfitSuggestions(userId: String, weatherCondition: String): List<WardrobeItem> = withContext(Dispatchers.IO) {
        try {
            client.postgrest["wardrobe_items"]
                .select {
                    filter {
                        eq("user_id", userId)
                        eq("laundry_status", "clean")
                    }
                }
                .decodeList<WardrobeItem>()
        } catch (e: Exception) {
            emptyList()
        }
    }
}
