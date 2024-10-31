import React, { useCallback, useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USER } from "../queries";
import Search from "../components/Search";

const SearchScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");

  const [searchUser, { loading, error, data }] = useLazyQuery(SEARCH_USER);

  const handleSearch = useCallback(
    text => {
      setSearch(text);
      if (text.length > 0) {
        searchUser({
          variables: {
            input: {
              keyword: text,
            },
          },
        });
      }
    },
    [searchUser]
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search" value={search} onChangeText={handleSearch} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3897f0" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {error && <Text>Error: {error.message}</Text>}

      {/* Search Results */}
      {!loading && data && data.searchUser.length > 0 ? (
        <FlatList data={data.searchUser} keyExtractor={item => item._id} renderItem={({ item }) => <Search user={item} navigation={navigation} />} />
      ) : (
        !loading &&
        search.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={100} color="#ddd" />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )
      )}

      {search.length < 1 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={100} color="#ddd" />
          <Text style={styles.emptyStateText}>Start searching users</Text>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    margin: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default SearchScreen;
