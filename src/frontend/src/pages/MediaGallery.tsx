import { useState } from 'react';
import { useGetMedia, useAddMedia, useGetAllProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export default function MediaGallery() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { data: media, isLoading: mediaLoading } = useGetMedia();
  const { data: allProfiles } = useGetAllProfiles();
  const addMedia = useAddMedia();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    await addMedia.mutateAsync({ file: blob, description });
    setFile(null);
    setDescription('');
    setUploadProgress(0);
  };

  const getProfileName = (principal: Principal): string => {
    const profile = allProfiles?.find((p) => p.displayName);
    return profile?.displayName || 'Family Member';
  };

  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isVideo = (url: string): boolean => {
    return url.includes('video') || file?.type.startsWith('video/') || false;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Share Photos & Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="border-warm-200"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-warm-200"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="w-full bg-warm-200 rounded-full h-2">
                  <div
                    className="bg-warm-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">{uploadProgress}% uploaded</p>
              </div>
            )}
            <Button type="submit" disabled={!file || addMedia.isPending} className="w-full sm:w-auto">
              {addMedia.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-warm-900 dark:text-warm-100">Family Gallery</h2>

        {mediaLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
          </div>
        ) : media && media.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item, index) => {
              const authorName = getProfileName(item.author);
              const initials = authorName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const mediaUrl = item.file.getDirectURL();

              return (
                <Card key={index} className="border-warm-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-square bg-warm-100 relative">
                    {mediaUrl.includes('video') ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={item.description}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-warm-300">
                        <AvatarFallback className="bg-warm-200 text-warm-800 font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-warm-900 dark:text-warm-100">{authorName}</h3>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                        {item.description && (
                          <p className="text-sm text-foreground mt-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-warm-200">
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-warm-400" />
              <p className="text-muted-foreground">No photos or videos yet. Share your first memory!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
