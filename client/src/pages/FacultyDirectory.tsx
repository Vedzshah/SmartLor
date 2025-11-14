import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacultyCard } from "@/components/FacultyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search, ArrowLeft, Plus } from "lucide-react";
import type { Faculty } from "@shared/schema";

export default function FacultyDirectory() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faculty, isLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
  });

  const filteredFaculty = faculty?.filter((f) => {
    const search = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(search) ||
      f.department.toLowerCase().includes(search) ||
      f.designation.toLowerCase().includes(search) ||
      f.coursesTaught?.some((course) => course.toLowerCase().includes(search))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Faculty Directory</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Faculty Profiles</h2>
              <p className="text-muted-foreground mt-1">
                Browse our directory of faculty members
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-faculty"
            />
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                </div>
              ))}
            </div>
          ) : filteredFaculty && filteredFaculty.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {filteredFaculty.length} {filteredFaculty.length === 1 ? 'faculty member' : 'faculty members'}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFaculty.map((f) => (
                  <FacultyCard key={f.id} faculty={f} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No faculty members found matching your search." : "No faculty members available."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
