import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../dashboard.js';
import HospitalMapScreen from '../hospital-map.js';

const Stack = createStackNavigator();

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      cardStyle: { backgroundColor: '#F8F9FA' }
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="HospitalMap" component={HospitalMapScreen} />
  </Stack.Navigator>
);

export default AppStack;
