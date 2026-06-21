package com.yourclothes.app.data

import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository {
    private val client = SupabaseClient.client

    suspend fun signUp(email: String, password: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            client.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signIn(email: String, password: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            client.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signOut() = withContext(Dispatchers.IO) {
        client.auth.signOut()
    }

    fun getCurrentUser() = client.auth.currentSessionOrNull()?.user
}
