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
import com.yourclothes.app.ui.wardrobe.WardrobeItemCard

@Composable
fun OutfitGeneratorScreen(viewModel: OutfitViewModel) {
    val state by viewModel.state.collectAsState()
    var occasion by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "AI Outfit Generator",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Stijlvol advies van MIRROR AI",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = occasion,
            onValueChange = { occasion = it },
            label = { Text("Waar ga je naartoe?") },
            placeholder = { Text("bijv. Een chique bruiloft, sollicitatie") },
            modifier = Modifier.fillMaxWidth(),
            enabled = state !is OutfitState.Loading
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { viewModel.generate(occasion) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            enabled = occasion.isNotBlank() && state !is OutfitState.Loading
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
                ResultCard(s.items, s.reasoning, 
                    onSave = { viewModel.saveToPlanner(s.items, occasion) },
                    onReset = { viewModel.reset() }
                )
            }
            is OutfitState.Error -> {
                Text(s.message, color = MaterialTheme.colorScheme.error)
            }
            else -> {}
        }
    }
}

@Composable
fun ResultCard(items: List<WardrobeItem>, reasoning: String, onSave: () -> Unit, onReset: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Je perfecte outfit:", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.height(200.dp)
            ) {
                items(items) { item ->
                    WardrobeItemCard(item)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            Row(verticalAlignment = Alignment.Top) {
                Icon(Icons.Default.Info, null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    reasoning,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            Button(onClick = onSave, modifier = Modifier.fillMaxWidth()) {
                Text("Opslaan in Planner")
            }
            TextButton(onClick = onReset, modifier = Modifier.fillMaxWidth()) {
                Text("Andere outfit")
            }
        }
    }
}
