package com.yourclothes.app.data

import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Serializable
data class PlannedOutfit(
    val id: String? = null,
    @SerialName("user_id")
    val userId: String,
    val date: String,
    val occasion: String? = null,
    val items: List<WardrobeItem> = emptyList(),
    val notes: String? = null,
    @SerialName("weather_condition")
    val weatherCondition: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null,
    @SerialName("updated_at")
    val updatedAt: String? = null
)

@Serializable
data class OccasionTemplate(
    val id: String? = null,
    val name: String,
    val description: String? = null,
    @SerialName("suggested_categories")
    val suggestedCategories: List<String> = emptyList()
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
                    order("date", order = Order.ASCENDING)
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
                    filter { eq("id", outfit.id ?: "") }
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
        listOf(
            OccasionTemplate("1", "Casual", "Alledaags", listOf("T-shirts", "Jeans")),
            OccasionTemplate("2", "Business", "Werk", listOf("Overhemden", "Pantalons")),
            OccasionTemplate("3", "Formeel", "Feest", listOf("Pakken", "Jurken")),
            OccasionTemplate("4", "Sport", "Training", listOf("Sportshirts")),
            OccasionTemplate("5", "Feest", "Party", listOf("Accessoires"))
        )
    }
}
