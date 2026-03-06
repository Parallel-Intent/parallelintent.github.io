# Pages & Content

Site pages and content collections for parallelintent.io.

```mermaid
flowchart TD
    classDef done fill:#4a7c59,color:#fff,stroke:#4a7c59
    classDef inprogress fill:#c8b89a,color:#1a1916,stroke:#c8b89a
    classDef todo fill:#5a5750,color:#e8e4dc,stroke:#5a5750
    classDef blocked fill:#8b3a3a,color:#fff,stroke:#8b3a3a

    Index[Home / Landing]:::done
    Writing[Writing List]:::done
    WritingSlug[Writing Detail]:::done
    Work[Work Page]:::inprogress
    Now[Now Page]:::done
    Contact[Contact]:::done

    WritingCollection[Writing Collection]:::inprogress
    NowCollection[Now Collection]:::done

    WritingCollection --> Writing
    WritingCollection --> WritingSlug
    NowCollection --> Now

    Index --> Writing
    Index --> Work
    Index --> Now
    Index --> Contact
    class NowCollection blocked
    class Writing blocked
    class WritingCollection blocked
```

## Work

Two sections added:
- **Orbs** (open source) — small self-contained tools, links to GitHub org
- **Waves** (aligned workflows) — the operating layer between human judgment and machine speed. Status: in progress.

## WritingCollection

Only one post exists ("Aligned at the source", status: seed). Collection schema supports seed/growing/evergreen statuses and tags — infrastructure is ready, needs more content.

## Contact

Implemented as a mailto link in Nav (k@parallelintent.io). No contact form.
