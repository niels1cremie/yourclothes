package com.yourclothes.app.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String,
    @SerialName("first_name")
    val first_name: String? = null,
    @SerialName("last_name")
    val last_name: String? = null,
    @SerialName("date_of_birth")
    val date_of_birth: String? = null,
    val age: Int? = null,
    val gender: String? = null,
    @SerialName("body_shape")
    val body_shape: String? = null,
    @SerialName("skin_undertone")
    val skin_undertone: String? = null,
    @SerialName("color_season")
    val color_season: String? = null,
    @SerialName("onboarding_completed")
    val onboarding_completed: Boolean = false
)

class ProfileRepository(context: Context) {
    private val client = SupabaseClient.client
    private val TAG = "ProfileRepository"
    
    private val sharedPrefs: SharedPreferences = context.getSharedPreferences(
        "onboarding_prefs",
        Context.MODE_PRIVATE
    )
    
    companion object {
        private const val KEY_ONBOARDING_COMPLETED = "onboarding_completed"
        private const val KEY_USER_ID = "user_id"
    }

    suspend fun getProfile(userId: String): UserProfile? = withContext(Dispatchers.IO) {
        try {
            client.postgrest["profiles"]
                .select {
                    filter { eq("id", userId) }
                }
                .decodeSingleOrNull<UserProfile>()
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching profile", e)
            null
        }
    }

    suspend fun updateProfile(profile: UserProfile): Boolean = withContext(Dispatchers.IO) {
        try {
            client.postgrest["profiles"].upsert(profile)
            if (profile.onboarding_completed) {
                setOnboardingCompletedLocally(profile.id, true)
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error updating profile", e)
            false
        }
    }

    fun isOnboardingCompletedLocally(userId: String): Boolean {
        val savedUserId = sharedPrefs.getString(KEY_USER_ID, null)
        val onboardingCompleted = sharedPrefs.getBoolean(KEY_ONBOARDING_COMPLETED, false)
        return savedUserId == userId && onboardingCompleted
    }
    
    fun setOnboardingCompletedLocally(userId: String, completed: Boolean) {
        sharedPrefs.edit()
            .putString(KEY_USER_ID, userId)
            .putBoolean(KEY_ONBOARDING_COMPLETED, completed)
            .apply()
    }
}
