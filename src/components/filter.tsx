import { IconFilter, IconRefresh, IconSearch } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type FilterButton = {
  label: string;
  value: string;
};

type FilterProps = {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  onRefresh: () => void;
  badgeType: "monitor" | "incident";
  filterButtons: FilterButton[];
  filter: string;
  setFilter: (filter: string) => void;
};

export default function Filter({
  searchTerm,
  setSearchTerm,
  onRefresh,
  badgeType,
  filterButtons,
  filter,
  setFilter,
}: FilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFilter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={`Search ${badgeType}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button, index) => (
              <Button
                key={index}
                variant={button.value === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(button.value)}
              >
                {button.label}
              </Button>
            ))}
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
