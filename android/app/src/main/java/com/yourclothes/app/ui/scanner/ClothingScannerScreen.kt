package com.yourclothes.app.ui.scanner

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.yourclothes.app.data.WardrobeItem
import java.io.File
import androidx.core.content.FileProvider

@Composable
fun ClothingScannerScreen(viewModel: ScannerViewModel) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current
    
    // Camera Support
    var tempPhotoUri by remember { mutableStateOf<Uri?>(null) }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture(),
        onResult = { success ->
            if (success && tempPhotoUri != null) {
                viewModel.processImage(tempPhotoUri!!, context)
            }
        }
    )

    // Gallery Support
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            if (uri != null) {
                viewModel.processImage(uri, context)
            }
        }
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Kleding Scanner",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Voeg nieuwe items toe met AI",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(48.dp))

        when (val s = state) {
            is ScannerState.Idle -> {
                ScannerOptions(
                    onCameraClick = {
                        val file = File(context.cacheDir, "temp_scan.jpg")
                        val uri = FileProvider.getUriForFile(
                            context,
                            "${context.packageName}.fileprovider",
                            file
                        )
                        tempPhotoUri = uri
                        cameraLauncher.launch(uri)
                    },
                    onGalleryClick = {
                        galleryLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    }
                )
            }
            is ScannerState.Uploading -> {
                LoadingState("Foto wordt geüpload...")
            }
            is ScannerState.Analyzing -> {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Card(
                        modifier = Modifier.size(200.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        AsyncImage(
                            model = s.imageUrl,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                    LoadingState("MIRROR AI analyseert je kleding...")
                }
            }
            is ScannerState.Success -> {
                SuccessState(s.item) { viewModel.reset() }
            }
            is ScannerState.Error -> {
                ErrorState(s.message) { viewModel.reset() }
            }
        }
    }
}

@Composable
fun ScannerOptions(onCameraClick: () -> Unit, onGalleryClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        OutlinedCard(
            onClick = onCameraClick,
            modifier = Modifier.weight(1f).height(160.dp),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.AddAPhoto, null, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("Camera")
            }
        }

        OutlinedCard(
            onClick = onGalleryClick,
            modifier = Modifier.weight(1f).height(160.dp),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.PhotoLibrary, null, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("Galerij")
            }
        }
    }
}

@Composable
fun LoadingState(message: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        CircularProgressIndicator(modifier = Modifier.size(48.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text(message)
    }
}

@Composable
fun SuccessState(item: WardrobeItem, onDone: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(
            Icons.Default.CheckCircle,
            null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Item toegevoegd!", style = MaterialTheme.typography.titleLarge)
        Text("${item.category} - ${item.color ?: ""}", style = MaterialTheme.typography.bodyMedium)
        
        Spacer(modifier = Modifier.height(32.dp))
        Button(onClick = onDone, modifier = Modifier.fillMaxWidth()) {
            Text("Nog een item scannen")
        }
    }
}

@Composable
fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Oeps!", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.error)
        Text(message, style = MaterialTheme.typography.bodyMedium)
        Spacer(modifier = Modifier.height(32.dp))
        Button(onClick = onRetry) {
            Text("Probeer opnieuw")
        }
    }
}
