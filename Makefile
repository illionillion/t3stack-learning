.PHONY: dev db-start db-setup

# データベース起動
db-start:
	./start-database.sh

# Prismaのセットアップ（migrate優先。なければgenerate）
db-setup:
	@if [ -f prisma/migrations ]; then \
		echo "Running prisma migrate..."; \
		pnpm db:migrate; \
	else \
		echo "Running prisma generate..."; \
		pnpm db:generate; \
	fi

# 開発サーバ起動
dev: db-start db-setup
	pnpm dev
