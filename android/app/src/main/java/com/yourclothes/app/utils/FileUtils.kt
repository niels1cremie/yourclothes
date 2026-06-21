package com.yourclothes.app.utils

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream

/**
 * Utility class for lossless file operations.
 * All file operations preserve original quality without compression.
 */
object FileUtils {
    
    /**
     * Copy InputStream to OutputStream without any compression or modification.
     * This ensures bit-exact copying of the original file.
     */
    fun copyStreamToStream(input: InputStream, output: OutputStream) {
        val buffer = ByteArray(8192) // 8KB buffer for efficient copying
        var bytesRead: Int
        while (input.read(buffer).also { bytesRead = it } != -1) {
            output.write(buffer, 0, bytesRead)
        }
        output.flush()
    }

    /**
     * Copy file to another location without any compression.
     * Uses direct byte-to-byte copying for exact preservation.
     */
    fun copyFile(source: File, destination: File) {
        FileInputStream(source).use { input ->
            FileOutputStream(destination).use { output ->
                copyStreamToStream(input, output)
            }
        }
    }

    /**
     * Read file as raw ByteArray without any processing or compression.
     */
    fun readFileToBytes(file: File): ByteArray {
        return file.readBytes()
    }

    /**
     * Write raw ByteArray to file without any compression.
     */
    fun writeBytesToFile(bytes: ByteArray, file: File) {
        file.writeBytes(bytes)
    }

    /**
     * Copy Uri content to local file without any compression.
     * This is useful for saving files from content providers.
     */
    fun copyUriToFile(context: Context, uri: Uri, destinationFile: File) {
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(destinationFile).use { output ->
                copyStreamToStream(input, output)
            }
        } ?: throw IllegalArgumentException("Cannot open input stream for URI: $uri")
    }

    /**
     * Read Uri content as raw ByteArray without any compression.
     */
    fun readUriToBytes(context: Context, uri: Uri): ByteArray {
        return context.contentResolver.openInputStream(uri)?.use { input ->
            input.readBytes()
        } ?: throw IllegalArgumentException("Cannot open input stream for URI: $uri")
    }

    /**
     * Get file extension from MIME type while preserving original format.
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
     * Create a file in app's private storage directory with guaranteed directory structure.
     */
    fun createPrivateFile(context: Context, subdirectory: String, fileName: String): File {
        val directory = File(context.filesDir, subdirectory).apply {
            if (!exists()) mkdirs()
        }
        return File(directory, fileName)
    }
}
