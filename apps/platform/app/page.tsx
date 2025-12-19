import { Button } from "@hawk/ui/components/button"
import { Table, TableBody, TableHead, TableRow, TableHeader, TableCell } from "@hawk/ui/components/table"
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>30</TableCell>
              <TableCell>USA</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
