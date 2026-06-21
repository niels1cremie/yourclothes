package com.yourclothes.app.ui.wardrobe

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Droplets
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.compose.rememberAsyncImagePainter
import coil3.request.ImageRequest
import coil3.size.Scale
import coil3.size.Size
import com.yourclothes.app.data.WardrobeItem

@Composable
fun WardrobeScreen(viewModel: WardrobeViewModel) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current
    
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            if (uri != null) {
                viewModel.uploadAndAnalyze(uri, context)
            }
        }
    )

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    photoPickerLauncher.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
                },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.AddAPhoto, contentDescription = "Toevoegen")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp)) {
            Text(
                "Mijn Kledingkast",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            when (val s = state) {
                is WardrobeState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is WardrobeState.Error -> {
                    Text(s.message, color = MaterialTheme.colorScheme.error)
                }
                is WardrobeState.Success -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Show categorized items
                        s.categorizedItems.forEach { (category, items) ->
                            item {
                                Text(
                                    category.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() },
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            }
                            item {
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(2),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp),
                                    modifier = Modifier.heightIn(max = 800.dp)
                                ) {
                                    items(items) { item ->
                                        WardrobeItemCard(item)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WardrobeItemCard(item: WardrobeItem) {
    Card(
        modifier = Modifier.fillMaxWidth().aspectRatio(0.8f),
        shape = MaterialTheme.shapes.large
    ) {
        Box {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(item.image_url)
                    .size(Size.ORIGINAL)
                    .scale(Scale.FIT)
                    .build(),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            
            if (item.laundry_status == "dirty") {
                Surface(
                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f),
                    modifier = Modifier.align(Alignment.TopEnd).padding(8.dp),
                    shape = MaterialTheme.shapes.small
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.Droplets,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onError,
                        modifier = Modifier.padding(4.dp).size(16.dp)
                    )
                }
            }
            
            Surface(
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.7f),
                modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text(
                        item.category,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        item.style ?: "",
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 1
                    )
                }
            }
        }
    }
}
