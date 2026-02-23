import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useShareLocation, useGetAllProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, MapPin, Navigation, Shield } from 'lucide-react';

export default function LocationSharing() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const { identity } = useInternetIdentity();
  const { data: profiles, isLoading } = useGetAllProfiles();
  const shareLocation = useShareLocation();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to retrieve your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleShareLocation = async () => {
    if (!currentLocation) return;

    await shareLocation.mutateAsync({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-warm-200 shadow-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Please log in to access location sharing</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-2">Location Sharing</h1>
        <p className="text-muted-foreground">Share your location with family members for safety</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-warm-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-warm-500" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationError ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{locationError}</p>
              </div>
            ) : currentLocation ? (
              <div className="space-y-4">
                <div className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                  <p className="text-sm text-muted-foreground mb-2">Current Coordinates</p>
                  <p className="font-mono text-sm">
                    Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
                <Button
                  onClick={handleShareLocation}
                  className="w-full"
                  disabled={shareLocation.isPending}
                >
                  {shareLocation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Share Location with Family
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-warm-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-warm-500" />
              Family Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="space-y-3">
                {profiles.map((profile, index) => (
                  <div key={index} className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-warm-900 dark:text-warm-100 mb-1">
                          {profile.displayName}
                        </p>
                        {profile.location ? (
                          <div className="space-y-1">
                            <p className="text-sm font-mono text-muted-foreground">
                              Lat: {profile.location.latitude.toFixed(6)}, Lng: {profile.location.longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Updated: {new Date(Number(profile.location.timestamp) / 1000000).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Location not shared</p>
                        )}
                      </div>
                      <MapPin className="h-5 w-5 text-warm-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No family members found
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-warm-200 shadow-md bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Privacy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your location is only shared with family members you've connected with. 
              Location data is stored securely and you can stop sharing at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
