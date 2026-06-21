package com.yourclothes.app.ui.theme

import android.content.Context
import coil3.ImageLoader
import coil3.decode.ImageDecoderDecoder
import coil3.memory.MemoryCache
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.request.ImageRequest
import coil3.request.crossfade
import coil3.size.Scale
import coil3.size.Size
import okhttp3.OkHttpClient

object CoilConfig {
    fun createImageLoader(context: Context, okHttpClient: OkHttpClient): ImageLoader {
        return ImageLoader.Builder(context)
            .components {
                // Use OkHttp for networking
                add(OkHttpNetworkFetcherFactory(callFactory = { okHttpClient }))
                // Use ImageDecoderDecoder for modern Android
                add(ImageDecoderDecoder.Factory())
            }
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, 0.25) // Use 25% of available memory
                    .build()
            }
            .crossfade(false) // Disable crossfade for original quality
            .build()
    }
    
    /**
     * Configure an ImageRequest for original quality loading
     */
    fun configureOriginalQuality(request: ImageRequest.Builder): ImageRequest.Builder {
        return request
            .size(Size.ORIGINAL) // Load in original size
            .scale(Scale.FIT) // Don't crop, preserve aspect ratio
    }
}
