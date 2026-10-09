# Post-build script to regenerate Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate
echo "✅ Prisma client regenerated successfully"
