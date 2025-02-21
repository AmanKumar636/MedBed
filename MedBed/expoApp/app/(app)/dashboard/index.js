import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserDashboard from '../../dashboard';
import HospitalDashboard from '../../hospitalDashboard';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserDashboard" component={UserDashboard} />
      <Stack.Screen name="HospitalDashboard" component={HospitalDashboard} />
    </Stack.Navigator>
  );
}

export default App;
