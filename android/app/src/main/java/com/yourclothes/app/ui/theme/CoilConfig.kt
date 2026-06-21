package com.yourclothes.app.ui.theme

import coil3.ImageLoader
import coil3.decode.ImageDecoderDecoder
import coil3.memory.MemoryCache
import coil3.request.ImageRequest
import coil3.request.crossfade
import coil3.size.Scale
import coil3.size.Size
import okhttp3.OkHttpClient

object CoilConfig {
    fun createImageLoader(okHttpClient: OkHttpClient): ImageLoader {
        return ImageLoader.Builder(okHttpClient)
            .components {
                // Use ImageDecoderDecoder for modern Android with automatic ARGB_8888
                add(ImageDecoderDecoder.Factory())
            }
            .memoryCache {
                MemoryCache.Builder(okHttpClient)
                    .maxSizePercent(0.25) // Use 25% of available memory
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
