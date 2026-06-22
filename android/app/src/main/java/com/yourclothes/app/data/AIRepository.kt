package com.yourclothes.app.data

import io.github.jan.supabase.functions.functions
import io.ktor.client.call.body
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class UserAnalysisRequest(
    val firstName: String,
    val lastName: String,
    val dateOfBirth: String,
    val fullBodyImageUrl: String? = null,
    val faceImageUrl: String? = null
)

@Serializable
data class UserAnalysisResponse(
    val bodyShape: String,
    val skinUndertone: String,
    val colorSeason: String,
    val suggestedPalette: List<String>,
    val stylePersona: String
)

@Serializable
data class ClothingAnalysisRequest(
    val imageUrl: String
)

@Serializable
data class ClothingAnalysisResponse(
    val category: String,
    val color: String,
    val style: String,
    val fabric: String
)

@Serializable
data class OutfitGenerationRequest(
    val items: List<WardrobeItem>,
    val occasion: String,
    val weather: Map<String, String>? = null,
    val profile: UserProfile? = null
)

@Serializable
data class OutfitGenerationResponse(
    val selected_item_ids: List<String>,
    val reasoning: String
)

class AIRepository {
    private val client = SupabaseClient.client

    suspend fun analyzeUser(request: UserAnalysisRequest): Result<UserAnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val response = client.functions.invoke(
                function = "user-analyzer",
                body = request
            )
            val text = response.body<String>()
            val result = Json.decodeFromString<UserAnalysisResponse>(text)
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun analyzeClothing(request: ClothingAnalysisRequest): Result<ClothingAnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val response = client.functions.invoke(
                function = "clothing-analyzer",
                body = request
            )
            val text = response.body<String>()
            val result = Json.decodeFromString<ClothingAnalysisResponse>(text)
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generateOutfit(request: OutfitGenerationRequest): Result<OutfitGenerationResponse> = withContext(Dispatchers.IO) {
        try {
            val response = client.functions.invoke(
                function = "outfit-generator",
                body = request
            )
            val text = response.body<String>()
            val result = Json.decodeFromString<OutfitGenerationResponse>(text)
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
