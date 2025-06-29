'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useValidation } from '@/lib/contexts/ValidationContext';

export function ValidationErrorList() {
  const { errors, removeError } = useValidation();

  if (errors.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-700 mb-2">
            All validations passed!
          </h3>
          <p className="text-sm text-gray-600">
            Your data looks great. No issues found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.category]) {
      acc[error.category] = [];
    }
    acc[error.category].push(error);
    return acc;
  }, {} as Record<string, typeof errors>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedErrors).map(([category, categoryErrors]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>{category}</span>
              </div>
              <Badge variant="outline">
                {categoryErrors.length} issue{categoryErrors.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryErrors.map((error) => (
                <div
                  key={error.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    error.type === 'error' 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className={`h-4 w-4 ${
                          error.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                        <Badge variant={error.type === 'error' ? 'destructive' : 'secondary'}>
                          {error.entity} {error.rowIndex !== undefined ? `Row ${error.rowIndex + 1}` : ''}
                          {error.column && ` - ${error.column}`}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm font-medium mb-1 ${
                        error.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {error.message}
                      </p>
                      
                      {error.suggestion && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                          <ArrowRight className="h-3 w-3" />
                          <span>{error.suggestion}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeError(error.id)}
                    >
                      Mark Fixed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}