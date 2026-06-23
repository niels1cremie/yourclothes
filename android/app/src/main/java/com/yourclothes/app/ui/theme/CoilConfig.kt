package com.yourclothes.app.ui.theme

import android.content.Context
import coil3.ImageLoader
import coil3.memory.MemoryCache
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.request.ImageRequest
import coil3.request.crossfade
import coil3.size.Dimension
import coil3.size.Scale
import okhttp3.OkHttpClient

object CoilConfig {
    
    // Stel een max afmeting in voor afbeeldingen om OOM te voorkomen
    private const val MAX_IMAGE_SIZE = 1200
    
    fun createImageLoader(context: Context, okHttpClient: OkHttpClient): ImageLoader {
        return ImageLoader.Builder(context)
            .components {
                add(OkHttpNetworkFetcherFactory(callFactory = { okHttpClient }))
            }
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, 0.15) // Verlaagd van 25% naar 15% voor meer geheugenruimte
                    .build()
            }
            .crossfade(false)
            .build()
    }
    
    /**
     * Configureer voor efficiënte weergave - downsample afbeeldingen
     * die te groot zijn voor het scherm.
     */
    fun configureEfficientDisplay(request: ImageRequest.Builder): ImageRequest.Builder {
        return request
            .size(width = Dimension(MAX_IMAGE_SIZE), height = Dimension(MAX_IMAGE_SIZE))
            .scale(Scale.FIT)
    }
}
