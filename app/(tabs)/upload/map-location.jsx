import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	View,
	Button,
	StyleSheet,
	Alert,
	ActivityIndicator,
	Image,
	Text,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { firestore, getAuth } from '../../../firebaseConfig';
import {
	collection,
	doc,
	setDoc,
	query,
	where,
	getDocs,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import { useRouter } from 'expo-router';

const Search = () => {
	const [userLocation, setUserLocation] = useState(null);
	const [markerLocation, setMarkerLocation] = useState(null);
	const [locationExists, setLocationExists] = useState(false);
	const [loading, setLoading] = useState(true);
	const [fetchingAddress, setFetchingAddress] = useState(false);
	const [address, setAddress] = useState(null);
	const mapRef = useRef(null);

	const router = useRouter();
	const userAuth = getAuth();
	const user = userAuth.currentUser;

	useEffect(() => {
		if (!user) {
			Alert.alert('User not authenticated');
			return;
		}
		getLocationAsync();
		checkIfLocationExists();
	}, []);

	useEffect(() => {
		if (userLocation) {
			setLoading(false);
		}
	}, [userLocation]);

	useEffect(() => {
		if (markerLocation) {
			debouncedFetchAddress(markerLocation);
		}
	}, [markerLocation]);

	const getLocationAsync = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission to access location was denied');
			setLoading(false);
			return;
		}

		try {
			let currentLocation = await Location.getCurrentPositionAsync({});
			const { latitude, longitude } = currentLocation.coords;

			setUserLocation({ latitude, longitude });
			setMarkerLocation({ latitude, longitude });

			if (mapRef.current) {
				mapRef.current.animateToRegion({
					latitude,
					longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				});
			}
		} catch (error) {
			console.error('Error fetching location:', error);
			Alert.alert('Error fetching location.');
			setLoading(false);
		}
	};

	const checkIfLocationExists = async () => {
		if (!user) {
			Alert.alert('User not authenticated');
			return;
		}

		const { uid } = user;

		try {
			const q = query(
				collection(firestore, 'user_location'),
				where('user_uid', '==', uid)
			);
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				setLocationExists(true);
				querySnapshot.forEach((doc) => {
					const { latitude, longitude, address } = doc.data(); // Include address
					setMarkerLocation({ latitude, longitude });
					setAddress(address); // Set the existing address

					if (mapRef.current) {
						mapRef.current.animateToRegion({
							latitude,
							longitude,
							latitudeDelta: 0.0922,
							longitudeDelta: 0.0421,
						});
					}
				});
			} else {
				setLocationExists(false);
			}
		} catch (error) {
			console.error('Error checking location existence:', error);
			Alert.alert('Error checking location existence.');
		}
	};

	const handleConfirmLocation = async () => {
		if (!user) {
			Alert.alert('User not authenticated');
			return;
		}

		if (!markerLocation) {
			Alert.alert('Please set the marker to your desired location.');
			return;
		}

		if (locationExists) {
			Alert.alert('You have already selected a location.');
			return;
		}

		const { uid, displayName } = user;

		const locationData = {
			user_uid: uid,
			user_name: displayName,
			latitude: markerLocation.latitude,
			longitude: markerLocation.longitude,
			address: address, // Include address in the data
		};

		try {
			await setDoc(doc(firestore, 'user_location', uid), locationData);
			Alert.alert('Location data submitted successfully!');
			setLocationExists(true);
			router.push('/upload/seller-form');
		} catch (error) {
			console.error('Failed to submit location data:', error);
			Alert.alert('Failed to submit location data.');
		}
	};

	const handleRegionChange = (region) => {
		if (!locationExists) {
			setMarkerLocation({
				latitude: region.latitude,
				longitude: region.longitude,
			});
		}
	};

	const fetchAddress = async (location) => {
		setFetchingAddress(true);
		try {
			let [result] = await Location.reverseGeocodeAsync({
				latitude: location.latitude,
				longitude: location.longitude,
			});

			if (result) {
				const addressText = `${result.name}, ${result.street}, ${result.city}, ${result.region}, ${result.country}`;
				setAddress(addressText);
			} else {
				setAddress('Address not found');
			}
		} catch (error) {
			console.error('Failed to fetch address:', error);
			setAddress('Failed to fetch address');
		} finally {
			setFetchingAddress(false);
		}
	};

	const debouncedFetchAddress = useCallback(debounce(fetchAddress, 500), []);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#0000ff' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{userLocation && (
				<MapView
					ref={mapRef}
					style={styles.map}
					provider={PROVIDER_GOOGLE}
					initialRegion={{
						latitude: userLocation.latitude,
						longitude: userLocation.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
					onRegionChange={handleRegionChange}
				>
					{markerLocation && (
						<Marker
							coordinate={markerLocation}
							draggable={!locationExists}
							onDragEnd={(e) =>
								setMarkerLocation(e.nativeEvent.coordinate)
							}
						>
							<Image
								source={require('../../../assets/images/map_pin.png')}
								style={styles.markerImage}
							/>
						</Marker>
					)}
				</MapView>
			)}
			<View style={styles.addressContainer}>
				{fetchingAddress ? (
					<ActivityIndicator size='small' color='#0000ff' />
				) : (
					<Text style={styles.addressText}>
						{address
							? `Address: ${address}`
							: 'Fetching address...'}
					</Text>
				)}
			</View>
			<View style={styles.buttonContainer}>
				<Button
					title='Get Current Location'
					onPress={getLocationAsync}
				/>
				<Button
					title='Confirm Location'
					onPress={handleConfirmLocation}
					disabled={locationExists}
				/>
			</View>
			<Text>{userAuth?.currentUser?.displayName}</Text>
			<Text>{userAuth?.currentUser?.email}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	markerImage: {
		width: 70,
		height: 70,
		resizeMode: 'contain',
	},
	addressContainer: {
		padding: 20,
		backgroundColor: 'white',
	},
	addressText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'black',
	},
});

export default Search;
