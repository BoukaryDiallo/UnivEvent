import { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import Heading from '@/components/heading'
import { TextLink } from './text-link'
import { Search, Plus, ChevronLeft, ChevronRight, Database, Filter } from 'lucide-react'

interface ColumnConfig<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
}

interface ActionConfig<T> {
  label: string
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  asChild?: boolean
  href?: (item: T) => string
}

type ActionOrFunction<T> = ActionConfig<T>[] | ((item: T) => ActionConfig<T>[])

interface CrudListProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  actions?: ActionOrFunction<T>
  title: string
  description?: string
  createUrl?: string
  createLabel?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  emptyMessage?: string
  className?: string
  paginated?: boolean
  itemsPerPage?: number
}

export default function CrudList<T>({
  data,
  columns,
  actions = [],
  title,
  description,
  createUrl,
  createLabel = "Créer",
  searchable = true,
  searchPlaceholder = "Rechercher...",
  searchFields,
  emptyMessage = "Aucun élément trouvé",
  className,
  paginated = false,
  itemsPerPage = 10
}: CrudListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = searchable && searchFields
    ? data.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value && 
            typeof value === 'string' && 
            value.toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    : searchable
    ? data.filter((item) =>
        columns.some((column) => {
          const value = item[column.key]
          return value && 
            typeof value === 'string' && 
            value.toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    : data

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Pagination logic
  const totalPages = paginated ? Math.ceil(filteredData.length / itemsPerPage) : 1
  const startIndex = paginated ? (currentPage - 1) * itemsPerPage : 0
  const endIndex = paginated ? startIndex + itemsPerPage : filteredData.length
  const paginatedData = paginated ? filteredData.slice(startIndex, endIndex) : filteredData

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Database className="h-8 w-8" />
              {title}
            </h1>
            {description && (
              <p className="text-blue-100 mt-2">{description}</p>
            )}
          </div>
          {createUrl && (
            <Button 
              asChild 
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg h-12 px-6 font-medium"
            >
              <a href={createUrl} className="no-underline">
                <Plus className="h-5 w-5 mr-2" />
                {createLabel}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Search className="h-5 w-5" />
                {searchTerm ? 'Résultats de recherche' : 'Recherche'}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  className="w-80 pl-10 h-11 border-blue-200 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Table */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={String(column.key)} className="text-blue-700 font-semibold">
                      {column.label}
                    </TableHead>
                  ))}
                  {actions && <TableHead className="text-blue-700 font-semibold">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      {columns.map((column) => (
                        <TableCell key={String(column.key)} className="py-4">
                          {column.render 
                            ? column.render(item[column.key], item)
                            : String(item[column.key] || '')
                          }
                        </TableCell>
                      ))}
                      {(() => {
                        const itemActions = typeof actions === 'function' ? actions(item) : actions;
                        return itemActions.length > 0 && (
                          <TableCell className="py-4">
                            <div className="flex gap-2">
                              {itemActions.map((action: ActionConfig<T>, actionIndex: number) => (
                                <Button
                                  key={`${actionIndex}-${action.label}`}
                                  variant={action.variant || 'outline'}
                                  size="sm"
                                  onClick={() => action.onClick(item)}
                                  asChild={action.asChild}
                                  className="h-8 px-3 text-xs font-medium"
                                >
                                  {action.asChild && action.href ? (
                                    <TextLink href={action.href(item)} className="no-underline">{action.label}</TextLink>
                                  ) : (
                                    action.label
                                  )}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        );
                      })()}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + (actions ? 1 : 0)} 
                      className="text-center py-16"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Database className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">{emptyMessage}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un élément'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {paginated && totalPages > 1 && (
        <Card className="shadow-lg border-0">
          <CardContent className="flex items-center justify-between py-6 px-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Affichage</span> {startIndex + 1} à {Math.min(endIndex, filteredData.length)} 
              <span className="font-medium"> sur</span> {filteredData.length} résultats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-10 px-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 p-0 font-medium ${
                        currentPage === pageNumber 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-sm text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 p-0 font-medium ${
                        currentPage === totalPages 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-10 px-4"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
