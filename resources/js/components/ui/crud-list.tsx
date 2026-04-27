import { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import Heading from '@/components/heading'
import { TextLink } from './text-link'

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
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {createUrl && (
          <Button asChild>
            <a href={createUrl}>+ {createLabel}</a>
          </Button>
        )}
      </div>

      {/* Search */}
      {searchable && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{searchTerm? 'Résultats' :'' } </CardTitle>
            <Input
              placeholder={searchPlaceholder}
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
        </Card>
      )}

      {/* Table */}
      <Card className="shadow-xl">
        <CardContent className="p-0 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.label}
                  </TableHead>
                ))}
                {actions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')
                        }
                      </TableCell>
                    ))}
                    {(() => {
                      const itemActions = typeof actions === 'function' ? actions(item) : actions;
                      return itemActions.length > 0 && (
                        <TableCell>
                          <div className="flex gap-2">
                            {itemActions.map((action: ActionConfig<T>, actionIndex: number) => (
                              <Button
                                key={`${actionIndex}-${action.label}`}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={() => action.onClick(item)}
                                asChild={action.asChild}
                              >
                                {action.asChild && action.href ? (
                                  <TextLink href={action.href(item)}>{action.label}</TextLink>
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
                    className="text-center py-12 text-gray-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {paginated && totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Affichage {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} résultats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
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
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
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
              >
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
