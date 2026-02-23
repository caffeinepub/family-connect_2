import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useShareLocation, useGetFamilyLocations } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationSharing() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const shareLocation = useShareLocation();
  const { data: familyLocations, isLoading: locationsLoading } = useGetFamilyLocations();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleShareLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(location);

      await shareLocation.mutateAsync({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: BigInt(Date.now() * 1000000),
      });

      toast.success('Location shared successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100">Location Sharing</h1>
        <p className="text-muted-foreground mt-1">Share your location with family members</p>
      </div>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-warm-500" />
            Share Your Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleShareLocation}
            disabled={isGettingLocation || shareLocation.isPending}
            className="w-full"
          >
            {isGettingLocation || shareLocation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Share My Location
              </>
            )}
          </Button>

          {currentLocation && (
            <div className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
              <p className="text-sm font-medium text-warm-900 dark:text-warm-100 mb-2">Your Current Location</p>
              <p className="text-xs text-muted-foreground">
                Latitude: {currentLocation.latitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Longitude: {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔒 Your location is only shared with family members and is not stored permanently.
            </p>
          </div>
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
          {locationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : familyLocations && familyLocations.length > 0 ? (
            <div className="space-y-3">
              {familyLocations.map((loc: any, index: number) => (
                <div key={index} className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-warm-900 dark:text-warm-100">
                        {userProfile?.parents.find(p => p.principal.toString() === loc.user?.toString())?.name ||
                         userProfile?.children.find(c => c.principal.toString() === loc.user?.toString())?.name ||
                         'Family Member'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lat: {loc.latitude?.toFixed(6)}, Long: {loc.longitude?.toFixed(6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(Number(loc.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No family locations shared yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
