#!/bin/bash
# ============================================
# Testes CRUD — Laço API
# Rodar com: bash scripts/test-api.sh
# Pré-requisito: npm run dev rodando em localhost:3000
# ============================================

BASE="http://localhost:3000"
JQ="/c/Users/lucas/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
jq() { "$JQ" "$@"; }

echo "============================================"
echo "1. HEALTH CHECK"
echo "============================================"
curl -s "$BASE/api/health" | jq .

echo ""
echo "============================================"
echo "2. REGISTRAR USUÁRIO"
echo "============================================"
curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@laco.com","password":"123456","name":"Teste"}' | jq .

echo ""
echo "============================================"
echo "3. FAZER LOGIN (obter cookie de sessão)"
echo "============================================"
# Obter CSRF token
CSRF=$(curl -s -c cookies.txt "$BASE/api/auth/csrf" | jq -r '.csrfToken')
echo "CSRF Token: $CSRF"

# Login com credentials
curl -s -X POST "$BASE/api/auth/callback/credentials" \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=teste@laco.com&password=123456&csrfToken=$CSRF" \
  -L -o /dev/null -w "Login HTTP Status: %{http_code}\n"

# Verificar sessão
echo "Sessão:"
curl -s -b cookies.txt "$BASE/api/auth/session" | jq .

echo ""
echo "============================================"
echo "4. WEDDINGS — CRUD"
echo "============================================"

# POST — Criar casamento
echo "--- POST /api/weddings ---"
WEDDING=$(curl -s -X POST "$BASE/api/weddings" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "partnerName1": "Ana",
    "partnerName2": "Carlos",
    "weddingDate": "2026-11-15",
    "venue": "Fazenda Vila Rica",
    "city": "Campinas",
    "state": "SP",
    "style": "rústico",
    "estimatedGuests": 200,
    "estimatedBudget": 150000
  }')
echo "$WEDDING" | jq .
WEDDING_ID=$(echo "$WEDDING" | jq -r '.id')
echo "Wedding ID: $WEDDING_ID"

# GET — Listar casamentos
echo ""
echo "--- GET /api/weddings ---"
curl -s -b cookies.txt "$BASE/api/weddings" | jq .

# GET — Casamento por ID
echo ""
echo "--- GET /api/weddings/$WEDDING_ID ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID" | jq .

# PUT — Atualizar casamento
echo ""
echo "--- PUT /api/weddings/$WEDDING_ID ---"
curl -s -X PUT "$BASE/api/weddings/$WEDDING_ID" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "partnerName1": "Ana Maria",
    "partnerName2": "Carlos Eduardo",
    "venue": "Fazenda Vila Rica Premium",
    "city": "Campinas",
    "state": "SP",
    "style": "clássico",
    "estimatedGuests": 250,
    "estimatedBudget": 200000
  }' | jq .

echo ""
echo "============================================"
echo "5. GUESTS — CRUD"
echo "============================================"

# POST — Criar convidado
echo "--- POST /api/weddings/$WEDDING_ID/guests ---"
GUEST=$(curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/guests" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "19999998888",
    "city": "São Paulo",
    "state": "SP",
    "ddd": "11",
    "category": "familia_noivo",
    "rsvpStatus": "confirmado",
    "plusOne": true,
    "dietaryRestriction": "vegetariana"
  }')
echo "$GUEST" | jq .
GUEST_ID=$(echo "$GUEST" | jq -r '.id')

# GET — Listar convidados
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/guests ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/guests" | jq .

# GET — Filtrar por categoria
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/guests?category=familia_noivo ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/guests?category=familia_noivo" | jq .

# GET — Filtrar por status
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/guests?status=confirmado ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/guests?status=confirmado" | jq .

# GET — Convidado por ID
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/guests/$GUEST_ID ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/guests/$GUEST_ID" | jq .

# PUT — Atualizar convidado
echo ""
echo "--- PUT /api/weddings/$WEDDING_ID/guests/$GUEST_ID ---"
curl -s -X PUT "$BASE/api/weddings/$WEDDING_ID/guests/$GUEST_ID" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva Santos",
    "email": "maria@email.com",
    "rsvpStatus": "confirmado",
    "plusOne": true
  }' | jq .

echo ""
echo "============================================"
echo "6. GIFTS — CRUD"
echo "============================================"

# POST — Criar presente
echo "--- POST /api/weddings/$WEDDING_ID/gifts ---"
GIFT=$(curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/gifts" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jogo de Panelas Tramontina",
    "description": "Jogo com 7 peças antiaderente",
    "price": 459.90,
    "url": "https://amazon.com.br/dp/xxx",
    "store": "Amazon",
    "status": "available"
  }')
echo "$GIFT" | jq .
GIFT_ID=$(echo "$GIFT" | jq -r '.id')

# GET — Listar presentes
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/gifts ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/gifts" | jq .

# GET — Filtrar disponíveis
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/gifts?status=available ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/gifts?status=available" | jq .

# PUT — Atualizar presente
echo ""
echo "--- PUT /api/weddings/$WEDDING_ID/gifts/$GIFT_ID ---"
curl -s -X PUT "$BASE/api/weddings/$WEDDING_ID/gifts/$GIFT_ID" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jogo de Panelas Tramontina",
    "price": 489.90,
    "status": "reserved",
    "reservedBy": "Tia Lúcia"
  }' | jq .

echo ""
echo "============================================"
echo "7. VENDORS — CRUD"
echo "============================================"

# POST — Criar fornecedor
echo "--- POST /api/weddings/$WEDDING_ID/vendors ---"
VENDOR=$(curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/vendors" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buffet Maison",
    "category": "buffet",
    "phone": "19988887777",
    "email": "contato@buffetmaison.com",
    "budget": 45000,
    "status": "contratado"
  }')
echo "$VENDOR" | jq .
VENDOR_ID=$(echo "$VENDOR" | jq -r '.id')

# GET — Listar fornecedores
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/vendors ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/vendors" | jq .

# GET — Filtrar por categoria
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/vendors?category=buffet ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/vendors?category=buffet" | jq .

# GET — Filtrar por status
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/vendors?status=contratado ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/vendors?status=contratado" | jq .

# PUT — Atualizar fornecedor
echo ""
echo "--- PUT /api/weddings/$WEDDING_ID/vendors/$VENDOR_ID ---"
curl -s -X PUT "$BASE/api/weddings/$WEDDING_ID/vendors/$VENDOR_ID" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buffet Maison Premium",
    "category": "buffet",
    "budget": 52000,
    "status": "contratado"
  }' | jq .

echo ""
echo "============================================"
echo "8. BUDGET — CRUD + SUMMARY"
echo "============================================"

# POST — Criar itens de orçamento
echo "--- POST /api/weddings/$WEDDING_ID/budget (buffet) ---"
BUDGET1=$(curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/budget" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "category": "buffet",
    "description": "Buffet completo - 200 pessoas",
    "estimatedCost": 45000,
    "actualCost": 42000,
    "paidAmount": 21000,
    "status": "parcial"
  }')
echo "$BUDGET1" | jq .
BUDGET_ID=$(echo "$BUDGET1" | jq -r '.id')

echo ""
echo "--- POST /api/weddings/$WEDDING_ID/budget (decoração) ---"
curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/budget" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "category": "decoracao",
    "description": "Decoração completa do salão",
    "estimatedCost": 15000,
    "actualCost": 14500,
    "paidAmount": 14500,
    "status": "pago"
  }' | jq .

echo ""
echo "--- POST /api/weddings/$WEDDING_ID/budget (foto) ---"
curl -s -X POST "$BASE/api/weddings/$WEDDING_ID/budget" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "category": "foto",
    "description": "Fotógrafo + álbum",
    "estimatedCost": 8000,
    "status": "pendente"
  }' | jq .

# GET — Listar itens
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/budget ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/budget" | jq .

# GET — Filtrar por categoria
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/budget?category=buffet ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/budget?category=buffet" | jq .

# GET — Filtrar por status
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/budget?status=pendente ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/budget?status=pendente" | jq .

# GET — SUMMARY
echo ""
echo "--- GET /api/weddings/$WEDDING_ID/budget/summary ---"
curl -s -b cookies.txt "$BASE/api/weddings/$WEDDING_ID/budget/summary" | jq .

echo ""
echo "============================================"
echo "9. CLEANUP — Deletar tudo"
echo "============================================"

# DELETE — Convidado
echo "--- DELETE guest ---"
curl -s -X DELETE "$BASE/api/weddings/$WEDDING_ID/guests/$GUEST_ID" -b cookies.txt | jq .

# DELETE — Presente
echo "--- DELETE gift ---"
curl -s -X DELETE "$BASE/api/weddings/$WEDDING_ID/gifts/$GIFT_ID" -b cookies.txt | jq .

# DELETE — Fornecedor
echo "--- DELETE vendor ---"
curl -s -X DELETE "$BASE/api/weddings/$WEDDING_ID/vendors/$VENDOR_ID" -b cookies.txt | jq .

# DELETE — Budget item
echo "--- DELETE budget item ---"
curl -s -X DELETE "$BASE/api/weddings/$WEDDING_ID/budget/$BUDGET_ID" -b cookies.txt | jq .

# DELETE — Casamento (deleta em cascata o restante)
echo "--- DELETE wedding ---"
curl -s -X DELETE "$BASE/api/weddings/$WEDDING_ID" -b cookies.txt | jq .

# Cleanup cookie file
rm -f cookies.txt

echo ""
echo "============================================"
echo "✅ TODOS OS TESTES FINALIZADOS"
echo "============================================"
