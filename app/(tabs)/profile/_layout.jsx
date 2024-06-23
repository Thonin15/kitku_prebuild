import { Stack } from 'expo-router';
export default function ProfileLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen name='index' options={{ title: 'Profile' }} />
			<Stack.Screen name='manage-post' options={{ title: 'Manage Post' }} />
			<Stack.Screen
				name='edit-profile'
				options={{ title: 'Edit Profile' }}
			/>
		</Stack>
	);
}
