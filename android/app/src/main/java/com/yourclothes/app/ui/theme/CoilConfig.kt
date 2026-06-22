package com.yourclothes.app.ui.theme

import android.content.Context
import coil3.ImageLoader
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
                add(OkHttpNetworkFetcherFactory(callFactory = { okHttpClient }))
            }
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, 0.25)
                    .build()
            }
            .crossfade(false)
            .build()
    }
    
    fun configureOriginalQuality(request: ImageRequest.Builder): ImageRequest.Builder {
        return request
            .size(Size.ORIGINAL)
            .scale(Scale.FIT)
    }
}
