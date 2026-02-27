/**
 * Flotten-Import Component
 * Excel-Upload und -Parsing für Fahrzeugdaten
 */

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/apps/reference-app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/apps/reference-app/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/apps/reference-app/components/ui/alert'
import { Progress } from '@/apps/reference-app/components/ui/progress'
import { type FahrzeugEingabe } from '@/types/fahrzeug'

interface FlotteImportProps {
  onImport: (fahrzeuge: FahrzeugEingabe[]) => void
  onCancel?: () => void
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
}

interface ImportResult {
  success: boolean
  fahrzeuge: FahrzeugEingabe[]
  errors: string[]
  warnings: string[]
}

export function FlotteImport({
  onImport,
  onCancel,
  maxFileSize = 5,
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
}: FlotteImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      setResult({
        success: false,
        fahrzeuge: [],
        errors: [`Datei zu groß (${fileSizeMB.toFixed(2)} MB). Maximal ${maxFileSize} MB erlaubt.`],
        warnings: [],
      })
      return
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      setResult({
        success: false,
        fahrzeuge: [],
        errors: [`Ungültiges Dateiformat. Erlaubt sind: ${acceptedFormats.join(', ')}`],
        warnings: [],
      })
      return
    }

    setFile(selectedFile)
    setResult(null)
  }, [maxFileSize, acceptedFormats])

  const handleUpload = useCallback(async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate upload and parsing
    // In production, this would call a backend API or use a library like xlsx
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(i)
      }

      // Mock parsed data
      const mockFahrzeuge: FahrzeugEingabe[] = [
        {
          kennzeichen: 'KA-MF-001',
          fahrzeugtyp: 'PKW',
          hersteller: 'Mercedes-Benz',
          modell: 'E 220 d',
          erstzulassung: '2022-03-15',
          neuwert: 55000,
          zeitwert: 42000,
          nutzungsart: 'Werkverkehr',
        },
        {
          kennzeichen: 'KA-MF-002',
          fahrzeugtyp: 'Transporter',
          hersteller: 'Mercedes-Benz',
          modell: 'Sprinter 316 CDI',
          erstzulassung: '2021-06-10',
          neuwert: 38000,
          zeitwert: 28000,
          nutzungsart: 'Güterverkehr',
        },
      ]

      setResult({
        success: true,
        fahrzeuge: mockFahrzeuge,
        errors: [],
        warnings: [
          'Zeile 5: Kennzeichen "KA-XYZ" ungültig - übersprungen',
          'Zeile 12: Erstzulassung fehlt - Standardwert verwendet',
        ],
      })
    } catch (error) {
      setResult({
        success: false,
        fahrzeuge: [],
        errors: ['Fehler beim Verarbeiten der Datei. Bitte überprüfen Sie das Format.'],
        warnings: [],
      })
    } finally {
      setUploading(false)
      setProgress(100)
    }
  }, [file])

  const handleConfirm = useCallback(() => {
    if (result?.success && result.fahrzeuge.length > 0) {
      onImport(result.fahrzeuge)
    }
  }, [result, onImport])

  const handleReset = useCallback(() => {
    setFile(null)
    setResult(null)
    setProgress(0)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Flottenliste importieren
        </CardTitle>
        <CardDescription>
          Laden Sie eine Excel- oder CSV-Datei mit Ihren Fahrzeugdaten hoch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        {!file && !result && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Klicken zum Hochladen</span> oder Datei hierher ziehen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acceptedFormats.join(', ')} (max. {maxFileSize} MB)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Template Download */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Noch keine Vorlage? Laden Sie unsere Excel-Vorlage herunter:
              </p>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Vorlage herunterladen
              </Button>
            </div>
          </div>
        )}

        {/* File Selected */}
        {file && !result && (
          <div className="space-y-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Datei ausgewählt</AlertTitle>
              <AlertDescription>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>

            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Verarbeite Datei...</p>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? 'Verarbeite...' : 'Importieren'}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {result && (
          <div className="space-y-4">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Import erfolgreich</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {result.fahrzeuge.length} Fahrzeuge wurden erfolgreich importiert
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import fehlgeschlagen</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">Warnungen</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {result.success && (
                <Button onClick={handleConfirm} className="flex-1">
                  {result.fahrzeuge.length} Fahrzeuge übernehmen
                </Button>
              )}
              <Button variant="outline" onClick={handleReset}>
                {result.success ? 'Neue Datei' : 'Erneut versuchen'}
              </Button>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Abbrechen
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
