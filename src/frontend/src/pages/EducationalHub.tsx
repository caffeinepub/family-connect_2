import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGetEducationalData, useUploadQuestionPaper, useUploadAnswerScript } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Upload, FileText, Loader2, BookOpen, Brain } from 'lucide-react';
import AnalysisResults from '../components/AnalysisResults';
import DoubtClearingInterface from '../components/DoubtClearingInterface';

export default function EducationalHub() {
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const { data: educationalData, isLoading } = useGetEducationalData();
  const uploadQuestion = useUploadQuestionPaper();
  const uploadAnswer = useUploadAnswerScript();

  const handleQuestionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFile || !questionTitle.trim()) return;

    const fileBytes = new Uint8Array(await questionFile.arrayBuffer());
    const blob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
      setUploadProgress(prev => ({ ...prev, question: percentage }));
    });

    await uploadQuestion.mutateAsync({
      title: questionTitle.trim(),
      file: blob,
    });

    setQuestionTitle('');
    setQuestionFile(null);
    setUploadProgress(prev => ({ ...prev, question: 0 }));
  };

  const handleAnswerUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerFile) return;

    const fileBytes = new Uint8Array(await answerFile.arrayBuffer());
    const blob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
      setUploadProgress(prev => ({ ...prev, answer: percentage }));
    });

    await uploadAnswer.mutateAsync({ file: blob });

    setAnswerFile(null);
    setUploadProgress(prev => ({ ...prev, answer: 0 }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-2">Educational Hub</h1>
        <p className="text-muted-foreground">Upload study materials, get AI insights, and clear your doubts</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-warm-100 dark:bg-warm-900">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="doubts">Doubt Clearing</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-warm-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
                  <img 
                    src="/assets/generated/upload-question-icon.dim_128x128.png" 
                    alt="Upload" 
                    className="h-6 w-6"
                  />
                  Upload Question Paper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuestionUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-title">Title</Label>
                    <Input
                      id="question-title"
                      placeholder="e.g., Math Final Exam 2024"
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      className="border-warm-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-file">File</Label>
                    <Input
                      id="question-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                      className="border-warm-200"
                    />
                  </div>
                  {uploadProgress.question > 0 && uploadProgress.question < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress.question}%</span>
                      </div>
                      <div className="w-full bg-warm-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.question}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!questionFile || !questionTitle.trim() || uploadQuestion.isPending}
                    className="w-full"
                  >
                    {uploadQuestion.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Question Paper
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-warm-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-warm-500" />
                  Upload Answer Script
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnswerUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="answer-file">File</Label>
                    <Input
                      id="answer-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                      className="border-warm-200"
                    />
                  </div>
                  {uploadProgress.answer > 0 && uploadProgress.answer < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress.answer}%</span>
                      </div>
                      <div className="w-full bg-warm-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.answer}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!answerFile || uploadAnswer.isPending}
                    className="w-full"
                  >
                    {uploadAnswer.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Answer Script
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-warm-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-warm-500" />
                  Question Papers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
                  </div>
                ) : educationalData?.questionPapers && educationalData.questionPapers.length > 0 ? (
                  <div className="space-y-2">
                    {educationalData.questionPapers.map((paper) => (
                      <div key={paper.id} className="p-3 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                        <p className="font-medium text-sm">{paper.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded: {new Date(Number(paper.uploadTimestamp) / 1000000).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No question papers uploaded yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-warm-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-warm-500" />
                  Answer Scripts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
                  </div>
                ) : educationalData?.answerScripts && educationalData.answerScripts.length > 0 ? (
                  <div className="space-y-2">
                    {educationalData.answerScripts.map((script) => (
                      <div key={script.id} className="p-3 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(Number(script.uploadTimestamp) / 1000000).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No answer scripts uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisResults />
        </TabsContent>

        <TabsContent value="doubts">
          <DoubtClearingInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}
