package com.yourclothes.app.ui.wardrobe

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.size.Scale
import coil3.size.Size
import com.yourclothes.app.data.WardrobeItem
import com.yourclothes.app.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WardrobeScreen(viewModel: WardrobeViewModel, onNavigateToScanner: () -> Unit) {
    val state by viewModel.state.collectAsState()
    var isGridView by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Alle") }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("Mijn Kledingkast") },
                    actions = {
                        IconButton(onClick = { isGridView = !isGridView }) {
                            Icon(if (isGridView) Icons.Default.ViewList else Icons.Default.GridView, null)
                        }
                    }
                )
                SearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    onSearch = {},
                    active = false,
                    onActiveChange = {},
                    placeholder = { Text("Zoek kleding...") },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
                ) {}
                
                FilterChips(
                    selectedCategory = selectedCategory,
                    onCategorySelected = { selectedCategory = it }
                )
            }
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToScanner,
                icon = { Icon(Icons.Default.AddAPhoto, null) },
                text = { Text("Scannen") },
                containerColor = MaterialTheme.colorScheme.primary
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val s = state) {
                is WardrobeState.Loading -> LoadingView()
                is WardrobeState.Error -> ErrorView(message = s.message, onRetry = { viewModel.loadItems() })
                is WardrobeState.Success -> {
                    val filteredItems = s.items.filter { item ->
                        (selectedCategory == "Alle" || item.category.equals(selectedCategory, ignoreCase = true)) &&
                        (searchQuery.isBlank() || item.category.contains(searchQuery, ignoreCase = true) || 
                         item.color?.contains(searchQuery, ignoreCase = true) == true)
                    }

                    if (filteredItems.isEmpty()) {
                        EmptyView(
                            message = if (s.items.isEmpty()) "Je kledingkast is leeg.\nScan je eerste kledingstuk!" else "Geen resultaten gevonden.",
                            icon = Icons.Default.Inventory2
                        )
                    } else {
                        WardrobeList(
                            items = filteredItems,
                            isGridView = isGridView
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FilterChips(selectedCategory: String, onCategorySelected: (String) -> Unit) {
    val categories = listOf("Alle", "Top", "Broeken", "Schoenen", "Jassen", "Accessoires")
    
    ScrollableTabRow(
        selectedTabIndex = categories.indexOf(selectedCategory),
        edgePadding = 16.dp,
        containerColor = androidx.compose.ui.graphics.Color.Transparent,
        divider = {},
        indicator = {}
    ) {
        categories.forEach { category ->
            FilterChip(
                selected = selectedCategory == category,
                onClick = { onCategorySelected(category) },
                label = { Text(category) },
                modifier = Modifier.padding(horizontal = 4.dp),
                shape = MaterialTheme.shapes.medium
            )
        }
    }
}

@Composable
fun WardrobeList(items: List<WardrobeItem>, isGridView: Boolean) {
    if (isGridView) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(items) { item ->
                WardrobeItemCard(item)
            }
        }
    } else {
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(items) { item ->
                WardrobeListItem(item)
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
                    .data(item.imageUrl)
                    .size(Size.ORIGINAL)
                    .scale(Scale.FIT)
                    .build(),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            
            if (item.laundryStatus == "dirty") {
                Surface(
                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f),
                    modifier = Modifier.align(Alignment.TopEnd).padding(8.dp),
                    shape = MaterialTheme.shapes.small
                ) {
                    Icon(
                        Icons.Default.Opacity,
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
                    Text(item.category, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Text(item.style ?: "", style = MaterialTheme.typography.bodySmall, maxLines = 1)
                }
            }
        }
    }
}

@Composable
fun WardrobeListItem(item: WardrobeItem) {
    Card(
        modifier = Modifier.fillMaxWidth().height(80.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(item.category, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(item.color ?: "Geen kleur", style = MaterialTheme.typography.bodyMedium)
            }
            IconButton(onClick = {}) {
                Icon(Icons.Default.MoreVert, null)
            }
        }
    }
}
