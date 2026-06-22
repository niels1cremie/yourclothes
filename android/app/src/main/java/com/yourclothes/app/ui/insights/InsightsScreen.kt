package com.yourclothes.app.ui.insights

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.yourclothes.app.ui.components.*
import com.yourclothes.app.ui.wardrobe.WardrobeItemCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InsightsScreen(viewModel: InsightsViewModel) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Insights") })
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (val s = state) {
                is InsightsState.Loading -> LoadingView()
                is InsightsState.Error -> ErrorView(message = s.message, onRetry = { viewModel.loadInsights() })
                is InsightsState.Success -> {
                    InsightsContent(s)
                }
            }
        }
    }
}

@Composable
fun InsightsContent(state: InsightsState.Success) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "Je garderobe in cijfers",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            "Ontdek je kledingstijl en gewoontes",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(24.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            StatCard(
                label = "Totaal",
                value = state.totalItems.toString(),
                icon = Icons.Default.BarChart,
                modifier = Modifier.weight(1f)
            )
            StatCard(
                label = "Top Categorie",
                value = state.topCategory,
                icon = Icons.Default.PieChart,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Kleurverdeling", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.large
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                state.colorDistribution.forEach { (color, count) ->
                    ColorRow(color, count, state.totalItems)
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }

        if (state.leastWornItem != null) {
            Spacer(modifier = Modifier.height(32.dp))
            Text("Vergeten item?", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("Dit item heb je al lang niet gedragen", style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(16.dp))
            Box(modifier = Modifier.size(160.dp).align(Alignment.CenterHorizontally)) {
                WardrobeItemCard(state.leastWornItem)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        AIRecommendationCard(state.aiRecommendations ?: "Draag vaker lichte kleuren bij zonnig weer voor een frisse look!")
        
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(label, style = MaterialTheme.typography.labelSmall)
                Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ColorRow(color: String, count: Int, total: Int) {
    val percentage = (count.toFloat() / total.toFloat())
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(color, style = MaterialTheme.typography.bodyMedium)
            Text("${(percentage * 100).toInt()}%", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { percentage },
            modifier = Modifier.fillMaxWidth().height(8.dp),
            strokeCap = androidx.compose.ui.graphics.StrokeCap.Round,
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}

@Composable
fun AIRecommendationCard(recommendation: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)),
        shape = MaterialTheme.shapes.large
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
            Icon(Icons.Default.AutoAwesome, null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text("MIRROR AI Advies", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(recommendation, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
