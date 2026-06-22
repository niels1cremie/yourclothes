package com.yourclothes.app.ui.scanner

import android.Manifest
import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.yourclothes.app.ui.components.*
import java.io.File

@Composable
fun ClothingScannerScreen(viewModel: ScannerViewModel) {
    val context = LocalContext.current
    val state by viewModel.state.collectAsState()

    var hasCameraPermission by remember { mutableStateOf(false) }
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            if (uri != null) {
                viewModel.processImage(uri, context)
            }
        }
    )

    val imageCapture = remember { ImageCapture.Builder().build() }

    Scaffold { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (val s = state) {
                is ScannerState.Idle -> {
                    if (hasCameraPermission) {
                        CameraPreview(
                            imageCapture = imageCapture,
                            onCapture = { file ->
                                viewModel.processImage(Uri.fromFile(file), context)
                            },
                            onGalleryClick = {
                                galleryLauncher.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                )
                            }
                        )
                    } else {
                        ErrorView(
                            message = "Camera toestemming vereist om kleding te scannen.",
                            onRetry = { permissionLauncher.launch(Manifest.permission.CAMERA) }
                        )
                    }
                }
                is ScannerState.Uploading -> LoadingView(message = "Foto wordt geüpload...")
                is ScannerState.Analyzing -> LoadingView(message = "MIRROR AI analyseert je kledingstuk...")
                is ScannerState.Success -> SuccessScannerView(s.item) { viewModel.reset() }
                is ScannerState.Error -> ErrorView(message = s.message, onRetry = { viewModel.reset() })
            }
        }
    }
}

@Composable
fun CameraPreview(
    imageCapture: ImageCapture, 
    onCapture: (File) -> Unit,
    onGalleryClick: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val previewView = remember { PreviewView(context) }

    LaunchedEffect(Unit) {
        val cameraProviderFuture = androidx.camera.lifecycle.ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageCapture
                )
            } catch (e: Exception) {
                Log.e("Camera", "Binding failed", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())
        
        // Gallery Button
        IconButton(
            onClick = onGalleryClick,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 32.dp, bottom = 32.dp)
                .size(64.dp),
            colors = IconButtonDefaults.filledIconButtonColors(
                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.5f)
            )
        ) {
            Icon(Icons.Default.PhotoLibrary, contentDescription = "Galerij", modifier = Modifier.size(32.dp))
        }

        // Capture Button
        Button(
            onClick = {
                val file = File(context.cacheDir, "${System.currentTimeMillis()}.jpg")
                val outputOptions = ImageCapture.OutputFileOptions.Builder(file).build()
                imageCapture.takePicture(
                    outputOptions,
                    ContextCompat.getMainExecutor(context),
                    object : ImageCapture.OnImageSavedCallback {
                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                            onCapture(file)
                        }
                        override fun onError(exc: ImageCaptureException) {
                            Log.e("Camera", "Capture failed", exc)
                        }
                    }
                )
            },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
                .height(64.dp),
            shape = MaterialTheme.shapes.extraLarge,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
            Icon(Icons.Default.AddAPhoto, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Scan Kledingstuk")
        }
    }
}

@Composable
fun SuccessScannerView(item: com.yourclothes.app.data.WardrobeItem, onDone: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.CheckCircle,
            null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(80.dp)
        )
        Spacer(modifier = Modifier.height(24.dp))
        Text("Gescand!", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Item: ${item.category}", style = MaterialTheme.typography.bodyLarge)
        if (item.color != null) {
            Text("Kleur: ${item.color}", style = MaterialTheme.typography.bodyMedium)
        }
        if (item.style != null) {
            Text("Stijl: ${item.style}", style = MaterialTheme.typography.bodyMedium)
        }
        
        Spacer(modifier = Modifier.height(48.dp))
        Button(
            onClick = onDone, 
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium
        ) {
            Text("Nog een item scannen")
        }
    }
}
