package com.yourclothes.app.data

import com.yourclothes.app.BuildConfig
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.storage.StorageConfig
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.ContentType
import io.ktor.serialization.kotlinx.json.json
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

object SupabaseClient {
    // Configure OkHttp for optimal file upload
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val client = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_KEY
    ) {
        install(Auth)
        install(Postgrest)
        install(Storage) {
            // Configure Storage to preserve original quality
            config = StorageConfig(
                defaultBucket = "wardrobe-photos"
            )
        }
        install(Functions)
        
        // Configure HTTP client for raw byte transfer
        httpClient = HttpClient(OkHttp) {
            engine {
                preconfigured = okHttpClient
            }
            install(ContentNegotiation) {
                json()
            }
        }
    }
}
