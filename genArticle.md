# Article Generation Plan Based on Pain Point (wks_PainPoint table)

## 1. Input Data Structure

- Each article is generated for a single pain point (priority 8-10)
- Input fields:
  - id, slug, title, description, category, keywords, isUrgent, priority
  - Related workshop types (id, name, relevance)
  - Real cost data (if available): sample size, min, max, average

## 2. Article Generation Flow

1. Fetch pain point data (from DB or API)
2. Fetch related workshop types (from mapping table)
3. Fetch real cost data from service orders (if available)
4. Build OpenAI prompt with all context (see previous plan)
5. Call OpenAI (gpt-4o-mini) to generate structured article JSON
6. Validate and parse JSON output
7. Save article draft to database for review

## 3. Article Content Sections (from pain point)

- Title: Based on painPoint.title, SEO-optimized
- Meta: Use painPoint.keywords, category, urgency for metaTitle/metaDescription
- Common Causes: Derived from painPoint.keywords and category
- Diagnosis Steps: General + painPoint-specific steps
- Cost Estimation: Use real cost data if available, else AI estimate
- Safety Assessment: Use painPoint.priority and isUrgent
- Prevention Tips: Based on common causes and category
- Workshop Recommendations: Use mapped workshop types (relevance ≥7)
- FAQ: Use painPoint.keywords, category, and common user questions
- Related Articles: Link to other pain points in same category/priority

## 4. Output & Review

- Save generated article as DRAFT
- Manual review and edit for accuracy, tone, and SEO
- Publish after QA

## 5. Automation

- Batch process for all pain points with priority 8-10
- Schedule regular regeneration as new data/costs become available

## 6. Next Steps

- Implement fetchers for pain point, workshop types, and cost data
- Integrate with OpenAIArticleService
- Build admin UI for reviewing and publishing drafts
- Monitor quality and iterate prompt as needed
