import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/format";

const payouts = [
  { name: "Rina Wijaya", bank: "BCA", amount: 950_000, status: "Menunggu" },
  { name: "Dimas Pratama", bank: "Mandiri", amount: 1_425_000, status: "Dibayar" },
];

/** Every shadcn primitive in its TITIP DONG style, for checking against DESIGN.md. */
export function PrimitivesShowcase() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="sg-p-input">Nama di rekening</Label>
            <Input id="sg-p-input" placeholder="Contoh: Rina Wijaya" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sg-p-bank">Bank</Label>
            <Select>
              <SelectTrigger id="sg-p-bank" className="w-full">
                <SelectValue placeholder="Pilih bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bca">BCA</SelectItem>
                <SelectItem value="mandiri">Mandiri</SelectItem>
                <SelectItem value="bni">BNI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sg-p-notes">Catatan untuk jastiper (opsional)</Label>
            <Textarea id="sg-p-notes" placeholder="Contoh: warna hitam, ukuran 42" />
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Baru</Badge>
            <Badge variant="secondary">Katalog</Badge>
            <Badge variant="outline">Tokyo</Badge>
            <Badge variant="destructive">Sengketa</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar>
              <AvatarFallback>RW</AvatarFallback>
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu akun</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Rina Wijaya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Filter</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter trip</SheetTitle>
                  <SheetDescription>Pilih kota dan tanggal berangkat.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={() => toast.success("Titipan disetujui.")}>
              Tampilkan toast
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Rekening pencairan</CardTitle>
              <CardDescription>BCA, a.n. Rina Wijaya</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">1234567890</CardContent>
          </Card>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="waiting">Menunggu</TabsTrigger>
          <TabsTrigger value="done">Selesai</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jastiper</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.bank}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(p.amount)}
                  </TableCell>
                  <TableCell>{p.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="waiting" className="text-muted-foreground">
          Satu pencairan menunggu.
        </TabsContent>
        <TabsContent value="done" className="text-muted-foreground">
          Satu pencairan sudah dibayar.
        </TabsContent>
      </Tabs>
    </div>
  );
}
