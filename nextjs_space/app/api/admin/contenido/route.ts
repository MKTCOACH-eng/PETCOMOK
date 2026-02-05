import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  return user?.isAdmin === true;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = data.slug || data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing slug
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un contenido con este slug' },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        imageUrl: data.imageUrl || null,
        author: data.author || 'Equipo PETCOM',
        contentType: data.contentType || 'article',
        videoUrl: data.videoUrl || null,
        videoDuration: data.videoDuration || null,
        category: data.category || 'general',
        petType: data.petType || null,
        tags: data.tags || [],
        relatedProducts: data.relatedProducts || [],
        featured: data.featured || false,
        published: data.published || false,
        // New SEO and scheduling fields
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json(
      { error: 'Error al crear el contenido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'Error al obtener contenido' },
      { status: 500 }
    );
  }
}
