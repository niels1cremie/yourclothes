package com.yourclothes.app.ui.outfit

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.yourclothes.app.data.WardrobeItem
import com.yourclothes.app.ui.components.*
import com.yourclothes.app.ui.wardrobe.WardrobeItemCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OutfitGeneratorScreen(viewModel: OutfitViewModel) {
    val state by viewModel.state.collectAsState()
    var occasion by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("AI Outfit Generator") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                "Wat is de gelegenheid?",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Text(
                "Stijlvol advies van MIRROR AI op basis van jouw kast",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = occasion,
                onValueChange = { occasion = it },
                label = { Text("Gelegenheid") },
                placeholder = { Text("bijv. Zakelijke meeting, Date night, Sport") },
                modifier = Modifier.fillMaxWidth(),
                enabled = state !is OutfitState.Loading,
                shape = MaterialTheme.shapes.medium
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { viewModel.generate(occasion) },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = occasion.isNotBlank() && state !is OutfitState.Loading,
                shape = MaterialTheme.shapes.medium
            ) {
                if (state is OutfitState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Icon(Icons.Default.AutoAwesome, null)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Genereer Outfit")
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            when (val s = state) {
                is OutfitState.Success -> {
                    OutfitResult(s.items, s.reasoning, 
                        onSave = { viewModel.saveToPlanner(s.items, occasion) },
                        onReset = { viewModel.reset() }
                    )
                }
                is OutfitState.Error -> {
                    ErrorView(message = s.message, onRetry = { viewModel.generate(occasion) })
                }
                else -> {}
            }
        }
    }
}

@Composable
fun OutfitResult(items: List<WardrobeItem>, reasoning: String, onSave: () -> Unit, onReset: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text("Je perfecte match:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(20.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.height(220.dp)
            ) {
                items(items) { item ->
                    Box(modifier = Modifier.width(160.dp)) {
                        WardrobeItemCard(item)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)),
                shape = MaterialTheme.shapes.medium
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
                    Icon(Icons.Default.Info, null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        reasoning,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            
            Button(onClick = onSave, modifier = Modifier.fillMaxWidth(), shape = MaterialTheme.shapes.medium) {
                Text("Opslaan in Planner")
            }
            TextButton(onClick = onReset, modifier = Modifier.fillMaxWidth()) {
                Text("Probeer iets anders")
            }
        }
    }
}
