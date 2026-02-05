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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Check for slug conflict
    if (data.slug) {
      const existing = await prisma.article.findFirst({
        where: { 
          slug: data.slug,
          NOT: { id: params.id }
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un contenido con este slug' },
          { status: 400 }
        );
      }
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        imageUrl: data.imageUrl || null,
        author: data.author,
        contentType: data.contentType,
        videoUrl: data.videoUrl || null,
        videoDuration: data.videoDuration || null,
        category: data.category,
        petType: data.petType || null,
        tags: data.tags || [],
        relatedProducts: data.relatedProducts || [],
        featured: data.featured,
        published: data.published,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el contenido' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.article.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el contenido' },
      { status: 500 }
    );
  }
}
