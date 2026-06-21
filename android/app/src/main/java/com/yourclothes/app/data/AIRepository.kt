package com.yourclothes.app.data

import io.github.jan.supabase.functions.functions
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

class AIRepository {
    private val client = SupabaseClient.client

    suspend fun analyzeUser(request: UserAnalysisRequest): Result<UserAnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val response = client.functions.invoke(
                function = "user-analyzer",
                body = request
            )
            val result = Json.decodeFromString<UserAnalysisResponse>(response.bodyAsText())
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
            val result = Json.decodeFromString<ClothingAnalysisResponse>(response.bodyAsText())
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
