package com.yourclothes.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream

/**
 * Utility class for efficient image file operations with OOM prevention.
 * Includes downsampling for web-friendly image sizes.
 */
object FileUtils {
    
    private const val MAX_WIDTH = 1920
    private const val MAX_HEIGHT = 1920
    private const val JPEG_QUALITY = 85

    /**
     * Copy InputStream to OutputStream without any compression or modification.
     */
    fun copyStreamToStream(input: InputStream, output: OutputStream) {
        val buffer = ByteArray(8192)
        var bytesRead: Int
        while (input.read(buffer).also { bytesRead = it } != -1) {
            output.write(buffer, 0, bytesRead)
        }
        output.flush()
    }

    /**
     * Copy file to another location.
     */
    fun copyFile(source: File, destination: File) {
        FileInputStream(source).use { input ->
            FileOutputStream(destination).use { output ->
                copyStreamToStream(input, output)
            }
        }
    }

    /**
     * Read file as raw ByteArray.
     */
    fun readFileToBytes(file: File): ByteArray {
        return file.readBytes()
    }

    /**
     * Write raw ByteArray to file.
     */
    fun writeBytesToFile(bytes: ByteArray, file: File) {
        file.writeBytes(bytes)
    }

    /**
     * Copy Uri content to local file.
     */
    fun copyUriToFile(context: Context, uri: Uri, destinationFile: File) {
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(destinationFile).use { output ->
                copyStreamToStream(input, output)
            }
        } ?: throw IllegalArgumentException("Cannot open input stream for URI: $uri")
    }

    /**
     * Read Uri content and downsample to prevent OOM.
     * Returns compressed JPEG bytes for web-friendly size.
     */
    fun readAndDownsampleUri(context: Context, uri: Uri): ByteArray {
        return context.contentResolver.openInputStream(uri)?.use { input ->
            // First decode with inJustDecodeBounds to get dimensions
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeStream(input, null, options)
            
            // Calculate inSampleSize
            options.inSampleSize = calculateInSampleSize(options, MAX_WIDTH, MAX_HEIGHT)
            options.inJustDecodeBounds = false
            
            // Reset stream and decode with inSampleSize
            input.reset()
            val bitmap = BitmapFactory.decodeStream(input, null, options)
            
            // Compress to JPEG
            val outputStream = ByteArrayOutputStream()
            bitmap?.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, outputStream)
            bitmap?.recycle()
            outputStream.toByteArray()
        } ?: throw IllegalArgumentException("Cannot open input stream for URI: $uri")
    }

    /**
     * Read Uri content as raw ByteArray (for when original quality is needed).
     */
    fun readUriToBytes(context: Context, uri: Uri): ByteArray {
        return context.contentResolver.openInputStream(uri)?.use { input ->
            input.readBytes()
        } ?: throw IllegalArgumentException("Cannot open input stream for URI: $uri")
    }

    /**
     * Calculate optimal inSampleSize for downsampling.
     */
    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val (height: Int, width: Int) = options.outHeight to options.outWidth
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight: Int = height / 2
            val halfWidth: Int = width / 2

            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        return inSampleSize
    }

    /**
     * Get file extension from MIME type.
     */
    fun getExtensionFromMimeType(mimeType: String?): String {
        return when {
            mimeType?.contains("png") == true -> "png"
            mimeType?.contains("webp") == true -> "webp"
            mimeType?.contains("heic") == true -> "heic"
            mimeType?.contains("jpeg") == true || mimeType?.contains("jpg") == true -> "jpg"
            else -> "jpg"
        }
    }

    /**
     * Create a file in app's private storage directory.
     */
    fun createPrivateFile(context: Context, subdirectory: String, fileName: String): File {
        val directory = File(context.filesDir, subdirectory).apply {
            if (!exists()) mkdirs()
        }
        return File(directory, fileName)
    }
}
