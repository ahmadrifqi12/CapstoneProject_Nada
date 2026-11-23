/* Data contoh NADA. Jalankan: npm run db:seed  (atau npm run setup untuk skema + data contoh)
   Menolak berjalan bila database sudah berisi pengguna, kecuali dengan --force (menghapus semua data). */
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const OUT = path.join(process.cwd(), "data", "uploads", "seed");
fs.mkdirSync(OUT, { recursive: true });

// ───────────── Ilustrasi placeholder (SVG) — ganti dengan foto asli lewat CMS ─────────────
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, "0")).join("")}`;
}

function abaya(hex: string, variant: 0 | 1 | 2, bg: string) {
  const dark = shade(hex, 0.78);
  const light = shade(hex, 1.12);
  const fig = `
    <ellipse cx="300" cy="150" rx="60" ry="72" fill="${dark}"/>
    <ellipse cx="300" cy="162" rx="27" ry="35" fill="#e9d7c6"/>
    <path d="M232 262 L152 430 L190 446 L246 335Z" fill="${dark}"/>
    <path d="M368 262 L448 430 L410 446 L354 335Z" fill="${dark}"/>
    <path d="M300 205 C262 205 238 228 230 262 L196 335 L148 705 Q300 742 452 705 L404 335 L370 262 C362 228 338 205 300 205Z" fill="${hex}"/>
    <path d="M300 215 L300 715" stroke="${light}" stroke-width="3" opacity=".5"/>
    <path d="M250 330 L214 700 M350 330 L386 700" stroke="${dark}" stroke-width="3" opacity=".35"/>
    ${variant === 1 ? `<path d="M212 420 Q300 448 388 420" stroke="${dark}" stroke-width="10" fill="none" opacity=".55"/>` : ""}`;
  const transform =
    variant === 2 ? `transform="translate(-150 -140) scale(1.5)"` : variant === 1 ? `transform="translate(0 0)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${shade(bg, 0.93)}"/></linearGradient></defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <ellipse cx="300" cy="745" rx="170" ry="16" fill="#000" opacity=".07"/>
  <g ${transform}>${fig}</g></svg>`;
}

function banner(w: number, h: number, a: string, b: string, colors: string[]) {
  const figs = colors
    .map((c, i) => {
      const s = 0.62 - i * 0.04;
      const x = w * (0.40 + i * 0.17) - 300 * s;
      return `<g transform="translate(${x} ${h * 0.12}) scale(${s})">
        <ellipse cx="300" cy="150" rx="60" ry="72" fill="${shade(c, 0.78)}"/><ellipse cx="300" cy="162" rx="27" ry="35" fill="#e9d7c6"/>
        <path d="M232 262 L152 430 L190 446 L246 335Z M368 262 L448 430 L410 446 L354 335Z" fill="${shade(c, 0.78)}"/>
        <path d="M300 205 C262 205 238 228 230 262 L196 335 L148 705 Q300 742 452 705 L404 335 L370 262 C362 228 338 205 300 205Z" fill="${c}"/></g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>${figs}</svg>`;
}

const write = (name: string, svg: string) => {
  fs.writeFileSync(path.join(OUT, name), svg);
  return `/uploads/seed/${name}`;
};

// ───────────── Data ─────────────
type SeedProduct = {
  name: string; slug: string; category: string; price: number; material: string; description: string;
  featured: boolean; colors: { name: string; hex: string; stock: Record<string, number | null> }[];
};

const products: SeedProduct[] = [
  {
    name: "Abaya Lumen", slug: "abaya-lumen", category: "Abaya", price: 449000, featured: true,
    material: "Nidha premium, jatuh ringan dan tidak menerawang. Cuci tangan atau mesin mode lembut.",
    description: "Potongan lurus yang rapi dengan kancing tersembunyi dan lengan lebar. Dibuat untuk dipakai dari pagi sampai senja tanpa terasa berat.",
    colors: [
      { name: "Pasir", hex: "#D8C8AE", stock: { S: 6, M: 10, L: 4 } },
      { name: "Sage", hex: "#8FA58E", stock: { S: 3, M: 8, L: 5 } },
      { name: "Arang", hex: "#3A3A36", stock: { S: 5, M: 9, L: 2 } },
    ],
  },
  {
    name: "Abaya Sabila", slug: "abaya-sabila", category: "Abaya", price: 529000, featured: true,
    material: "Crinkle airflow, adem dan tidak perlu disetrika.",
    description: "Siluet A-line dengan detail lipit halus di dada. Pilihan untuk acara keluarga dan silaturahmi.",
    colors: [
      { name: "Hitam", hex: "#1F1F1C", stock: { S: 7, M: 12, L: 6 } },
      { name: "Mocha", hex: "#7B5B4A", stock: { S: 4, M: 6, L: 3 } },
      { name: "Navy", hex: "#2C3A52", stock: { S: 2, M: 5, L: 0 } },
    ],
  },
  {
    name: "Abaya Safa", slug: "abaya-safa", category: "Abaya", price: 489000, featured: true,
    material: "Linen blend, bernapas dan nyaman di cuaca tropis.",
    description: "Abaya harian bertekstur linen dengan saku samping yang dalam. Sederhana, lapang, dan mudah dipadukan.",
    colors: [
      { name: "Putih Tulang", hex: "#EDE6D8", stock: { S: 5, M: 7, L: 5 } },
      { name: "Dusty Rose", hex: "#C9A39A", stock: { S: 4, M: 6, L: 4 } },
      { name: "Olive", hex: "#7A7F5A", stock: { S: 3, M: 5, L: 2 } },
    ],
  },
  {
    name: "Abaya Rahma", slug: "abaya-rahma", category: "Abaya", price: 599000, featured: true,
    material: "Satin silk ringan dengan lapisan dalam breathable.",
    description: "Berkilau lembut dengan ikat pinggang yang bisa dilepas. Untuk hari yang perlu terasa istimewa.",
    colors: [
      { name: "Taupe", hex: "#A39382", stock: { S: 3, M: 5, L: 3 } },
      { name: "Hijau Botol", hex: "#3F5A4B", stock: { S: 2, M: 4, L: 2 } },
      { name: "Terakota", hex: "#B2705A", stock: { S: 1, M: 3, L: 1 } },
    ],
  },
  {
    name: "Set Dara", slug: "set-dara", category: "Set", price: 679000, featured: true,
    material: "Wolfis premium (abaya) dan voal ultrafine (hijab).",
    description: "Satu set abaya dan hijab segi empat dengan warna senada. Praktis, rapi, dan siap dipakai.",
    colors: [
      { name: "Krem", hex: "#E2D5BE", stock: { S: 4, M: 6, L: 3 } },
      { name: "Abu Batu", hex: "#8E8E86", stock: { S: 3, M: 5, L: 3 } },
      { name: "Lilac", hex: "#B7A9BF", stock: { S: 2, M: 4, L: 2 } },
    ],
  },
  {
    name: "Abaya Kenanga", slug: "abaya-kenanga", category: "Abaya", price: 459000, featured: true,
    material: "Katun twill ringan, tekstur halus dan kuat.",
    description: "Potongan kimono dengan lengan yang jatuh. Terinspirasi dari wangi bunga kenanga di halaman rumah nenek.",
    colors: [
      { name: "Kuning Gading", hex: "#E6D9A8", stock: { S: 4, M: 5, L: 3 } },
      { name: "Hijau Mint", hex: "#A9C3B1", stock: { S: 3, M: 4, L: 3 } },
      { name: "Cokelat Susu", hex: "#A98467", stock: { S: 2, M: 3, L: 2 } },
    ],
  },
];

const p = (html: string) => html.trim();

const stories = [
  {
    title: "Pasir di Ujung Senja: Cerita di Balik Abaya Lumen", slug: "cerita-abaya-lumen",
    days: 3, products: ["abaya-lumen"], colors: ["#D8C8AE", "#8FA58E", "#3A3A36"], bg: ["#EFE8DA", "#D8CDB8"],
    excerpt: "Lumen lahir dari kebiasaan sederhana: duduk menunggu senja di teras, dengan pakaian yang tidak membuat kita sibuk membetulkan.",
    body: p(`<p>Setiap koleksi NADA bermula dari satu pertanyaan sederhana: <em>pakaian seperti apa yang membuat kita tenang?</em> Untuk Lumen, jawabannya datang dari teras rumah di sore hari.</p>
<h2>Warna dari langit sore</h2><p>Pasir, sage, dan arang kami pilih karena ketiganya terlihat akrab di bawah cahaya apa pun. Pasir mengingatkan pada pantai yang sepi, sage pada daun yang baru dicuci hujan, dan arang pada bayangan panjang sebelum maghrib.</p>
<blockquote>Pakaian yang baik tidak berteriak. Ia hadir, nyaman, lalu terlupakan.</blockquote>
<h2>Potongan yang membiarkan Anda bergerak</h2><p>Lengan dibuat lebar, kancing disembunyikan, dan kainnya jatuh ringan. Kami menguji prototipe dengan berjalan, naik motor, dan duduk lama di majelis, lalu memangkas apa pun yang mengganggu.</p>`),
  },
  {
    title: "Mengapa Kami Memilih Linen untuk Abaya Safa", slug: "mengapa-linen-abaya-safa",
    days: 10, products: ["abaya-safa"], colors: ["#EDE6D8", "#C9A39A", "#7A7F5A"], bg: ["#EAE2D4", "#CDD3C4"],
    excerpt: "Linen sering dianggap mudah kusut. Justru di situlah keindahannya, dan alasan kami memakainya untuk pakaian harian.",
    body: p(`<p>Banyak orang bertanya, <em>bukankah linen mudah kusut?</em> Benar. Tetapi kerutan halus itulah yang membuat sebuah abaya terlihat hidup, bukan kaku.</p>
<h2>Bernapas di cuaca tropis</h2><p>Serat linen menyerap keringat dan cepat kering. Untuk perempuan yang beraktivitas dari pagi, itu bukan kemewahan, melainkan kebutuhan.</p>
<h2>Cara merawat</h2><ul><li>Cuci dengan air dingin dan deterjen lembut.</li><li>Jemur di tempat teduh.</li><li>Setrika saat masih sedikit lembap bila ingin tampilan lebih rapi.</li></ul>`),
  },
  {
    title: "Perjalanan Satu Helai: Dari Sketsa hingga Sampai di Rumah Anda", slug: "perjalanan-satu-helai",
    days: 21, products: ["abaya-sabila", "abaya-rahma"], colors: ["#1F1F1C", "#7B5B4A", "#3F5A4B"], bg: ["#E3DCCD", "#C8CFC2"],
    excerpt: "Sebuah abaya melewati banyak tangan sebelum sampai pada Anda. Ini sebagian kecil perjalanannya.",
    body: p(`<p>Semua dimulai dari sketsa di buku catatan yang sudah lusuh. Dari sana, pola dibuat, dipotong, dan dijahit menjadi prototipe pertama.</p>
<h2>Uji pakai</h2><p>Prototipe dipakai oleh tim dan beberapa teman selama dua minggu. Catatan mereka menentukan apakah potongan lengan perlu dilonggarkan atau panjang hem perlu diubah.</p>
<h2>Pengemasan</h2><p>Setiap pesanan dilipat, dikemas, dan diperiksa satu per satu sebelum dikirim.</p>`),
  },
  {
    title: "Catatan dari Dapur Desain: Palet Musim Ini", slug: "catatan-palet-musim-ini",
    days: -7, status: "DRAFT", products: [], colors: ["#B2705A", "#A39382"], bg: ["#EFE7DB", "#D9CBB8"],
    excerpt: "Draf yang belum terbit.",
    body: p(`<p>Draf ini belum diterbitkan. Terbitkan dari panel admin agar muncul di situs.</p>`),
  },
];

async function main() {
  const force = process.argv.includes("--force");
  if ((await db.user.count()) > 0 && !force) {
    console.log("Database sudah berisi data. Seed dibatalkan. Gunakan --force untuk menghapus dan mengisi ulang.");
    return;
  }
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.message.deleteMany();
  await db.story.deleteMany();
  await db.product.deleteMany();
  await db.siteSetting.deleteMany();
  await db.user.deleteMany();

  await db.user.create({
    data: { name: "Admin NADA", email: "admin@nada.id", role: "ADMIN", passwordHash: await bcrypt.hash("Admin#12345", 11) },
  });
  const buyer = await db.user.create({
    data: { name: "Aisyah Rahmawati", email: "pembeli@nada.id", role: "BUYER", passwordHash: await bcrypt.hash("pembeli123", 11) },
  });

  const bgs = ["#EFEAE0", "#E9E4D8", "#F1ECE2"];
  for (const sp of products) {
    await db.product.create({
      data: {
        name: sp.name, slug: sp.slug, category: sp.category, price: sp.price, material: sp.material,
        description: sp.description, featured: sp.featured, status: "ACTIVE",
        createdAt: new Date(Date.now() - (products.indexOf(sp) + 1) * 4 * 86400000),
        colors: {
          create: sp.colors.map((c, ci) => ({
            name: c.name, hex: c.hex, position: ci,
            images: {
              create: ([0, 1, 2] as const).map((v, i) => ({
                position: i,
                url: write(`${sp.slug}-${ci}-${i}.svg`, abaya(c.hex, v, bgs[(ci + i) % bgs.length])),
              })),
            },
            variants: { create: Object.entries(c.stock).map(([size, stock]) => ({ size, stock: stock ?? 0 })) },
          })),
        },
      },
    });
  }

  for (const s of stories) {
    const prods = await db.product.findMany({ where: { slug: { in: s.products } }, select: { id: true } });
    const draft = s.status === "DRAFT";
    await db.story.create({
      data: {
        title: s.title, slug: s.slug, excerpt: s.excerpt, body: s.body,
        cover: write(`story-${s.slug}.svg`, banner(1200, 800, s.bg[0], s.bg[1], s.colors)),
        status: draft ? "DRAFT" : "PUBLISHED",
        publishedAt: draft ? null : new Date(Date.now() - s.days * 86400000),
        products: { connect: prods },
      },
    });
  }

  const settings = {
    siteName: "NADA",
    tagline: "Abaya minimalis dengan cerita di baliknya.",
    heroTitle: "Tenang dalam setiap helai.",
    heroSubtitle: "Abaya berpotongan rapi untuk keseharian dan hari istimewa, dengan kisah di balik setiap koleksinya.",
    heroImage: write("hero.svg", banner(1600, 1000, "#ECE5D6", "#C9D2C3", ["#D8C8AE", "#8FA58E", "#3A3A36"])),
    heroCta: "Lihat koleksi",
    contactEmail: "halo@nada.id",
    contactPhone: "+62 812-3456-7890",
    whatsapp: "6281234567890",
    address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan 12120",
    hours: "Senin–Sabtu, 09.00–17.00 WIB",
    socials: [
      { platform: "instagram", handle: "@nada.abaya", url: "https://instagram.com/" },
      { platform: "tiktok", handle: "@nada.abaya", url: "https://tiktok.com/" },
      { platform: "whatsapp", handle: "+62 812-3456-7890", url: "https://wa.me/6281234567890" },
    ],
    shippingFee: 20000,
    freeShippingMin: 0,
    bankInfo: "Bank BCA 123 456 7890 a.n. NADA Abaya",
  };
  await db.siteSetting.create({ data: { key: "main", value: JSON.stringify(settings) } });

  // Pesanan contoh agar dashboard admin tidak kosong.
  const v = async (slug: string, color: string, size: string) =>
    db.productVariant.findFirstOrThrow({
      where: { size, color: { name: color, product: { slug } } },
      include: { color: { include: { product: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
    });
  const mk = async (code: string, status: string, ago: number, picks: [string, string, string, number][], tracking = "") => {
    const lines = await Promise.all(picks.map(async ([s, c, z, q]) => ({ v: await v(s, c, z), q })));
    const subtotal = lines.reduce((t, l) => t + l.v.color.product.price * l.q, 0);
    await db.order.create({
      data: {
        code, userId: buyer.id, status, recipient: buyer.name, phone: "081234567890",
        address: "Jl. Kenanga No. 5, Kec. Cilandak", city: "Jakarta Selatan", postalCode: "12430",
        subtotal, shippingFee: 20000, total: subtotal + 20000, trackingNumber: tracking,
        createdAt: new Date(Date.now() - ago * 3600000),
        items: {
          create: lines.map((l) => ({
            variantId: l.v.id, productName: l.v.color.product.name, colorName: l.v.color.name, size: l.v.size,
            image: l.v.color.images[0]?.url ?? "", price: l.v.color.product.price, qty: l.q,
          })),
        },
      },
    });
  };
  await mk("NADA-DEMO-0001", "SHIPPED", 72, [["abaya-lumen", "Sage", "M", 1]], "JNE1234567890");
  await mk("NADA-DEMO-0002", "PAID", 5, [["abaya-sabila", "Hitam", "M", 1], ["abaya-safa", "Dusty Rose", "S", 1]]);

  await db.message.create({
    data: { name: "Nabila", email: "nabila@example.com", body: "Halo, untuk Abaya Lumen ukuran M cocok untuk tinggi 160 cm dan berat 55 kg ya?" },
  });

  console.log("Seed selesai.\n  Admin   : admin@nada.id / Admin#12345  (masuk lewat /admin/login)\n  Pembeli : pembeli@nada.id / pembeli123");
}

main().finally(() => db.$disconnect());
