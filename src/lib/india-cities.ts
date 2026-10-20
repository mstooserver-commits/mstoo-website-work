export type IndiaCity = { name: string; state: string; lat: number; lng: number };

export const INDIA_CITIES: IndiaCity[] = [
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Mohali", state: "Punjab", lat: 30.7046, lng: 76.7179 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
];

export function nearestIndiaCity(lat: number, lng: number) {
  return INDIA_CITIES.reduce((nearest, city) => {
    const distance = (city.lat - lat) ** 2 + (city.lng - lng) ** 2;
    const nearestDistance = (nearest.lat - lat) ** 2 + (nearest.lng - lng) ** 2;
    return distance < nearestDistance ? city : nearest;
  });
}
