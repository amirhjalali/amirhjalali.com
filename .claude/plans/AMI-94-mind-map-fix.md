# AMI-94: Fix Mind Map Movement Issues

## Summary
Fix the Knowledge Graph component to stop constant jittery movement and add node dragging support.

**Issue:** [AMI-94](https://linear.app/amirhjalali/issue/AMI-94)
**Effort:** S (2-4 hours)
**File:** `/app/notes/components/KnowledgeGraph.tsx`

---

## Implementation Steps

### Step 1: Add Temperature-Based Cooling (30 min)

**Goal:** Make the simulation settle over time instead of running forever.

```typescript
// Add state for temperature
const [temperature, setTemperature] = useState(1.0)

// In the simulate function, before applying forces:
const newTemperature = temperature * 0.995 // Cool down each frame

// Stop if cooled enough
if (newTemperature < 0.01) {
  setTemperature(newTemperature)
  return // Don't request another frame
}

// Scale forces by temperature
const scaledForce = force * newTemperature

// Update temperature state
setTemperature(newTemperature)
```

**Changes:**
- Add `temperature` state initialized to 1.0
- Modify `simulate()` to multiply forces by temperature
- Add cooling: `temperature *= 0.995` each frame
- Stop animation when `temperature < 0.01`

---

### Step 2: Improve Velocity Damping (15 min)

**Goal:** Make nodes settle faster and stop jittering.

**Current (line 133-134):**
```typescript
node.vx! *= 0.9
node.vy! *= 0.9
```

**Change to:**
```typescript
node.vx! *= 0.7  // Lower = faster settling
node.vy! *= 0.7

// Also add velocity floor to stop micro-movements
if (Math.abs(node.vx!) < 0.1) node.vx = 0
if (Math.abs(node.vy!) < 0.1) node.vy = 0
```

---

### Step 3: Add Node Dragging (1-2 hours)

**Goal:** Allow users to click and drag individual nodes.

**Add state:**
```typescript
const [draggingNode, setDraggingNode] = useState<string | null>(null)
```

**Add handlers to node group (line 274-298):**
```typescript
<g
  key={node.id}
  transform={`translate(${node.x}, ${node.y})`}
  onMouseDown={(e) => {
    e.stopPropagation()
    setDraggingNode(node.id)
    setTemperature(0.3) // Reheat simulation slightly
  }}
  className="cursor-pointer"
>
```

**Modify handleMouseMove (line 162-168):**
```typescript
const handleMouseMove = (e: React.MouseEvent) => {
  if (draggingNode) {
    // Update dragged node position directly
    setNodes(prev => prev.map(n => {
      if (n.id === draggingNode) {
        const rect = svgRef.current?.getBoundingClientRect()
        if (rect) {
          return {
            ...n,
            x: (e.clientX - rect.left - pan.x - 400) / zoom,
            y: (e.clientY - rect.top - pan.y - 300) / zoom,
            vx: 0,
            vy: 0
          }
        }
      }
      return n
    }))
  } else if (isDragging) {
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }
}
```

**Modify handleMouseUp (line 171-173):**
```typescript
const handleMouseUp = () => {
  setIsDragging(false)
  setDraggingNode(null)
}
```

---

### Step 4: Add Pause/Play Toggle (30 min)

**Goal:** Let users pause the simulation entirely.

**Add state:**
```typescript
const [isPaused, setIsPaused] = useState(false)
```

**Add to simulation effect (line 82):**
```typescript
const simulate = () => {
  if (isPaused) {
    animationRef.current = requestAnimationFrame(simulate)
    return // Keep loop alive but don't update
  }
  // ... rest of simulation
}
```

**Add button to header (after refresh button, ~line 223):**
```typescript
<button
  onClick={() => setIsPaused(p => !p)}
  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
  title={isPaused ? "Resume" : "Pause"}
>
  {isPaused ? (
    <Play className="w-4 h-4 text-[#888888]" />
  ) : (
    <Pause className="w-4 h-4 text-[#888888]" />
  )}
</button>
```

**Add imports:**
```typescript
import { Play, Pause } from 'lucide-react'
```

---

## Testing Checklist

- [ ] Graph loads and nodes settle within 2-3 seconds
- [ ] Nodes stop moving completely after settling
- [ ] Clicking a node selects it (existing behavior preserved)
- [ ] Dragging a node moves it and slightly reheats simulation
- [ ] Releasing a dragged node lets it settle in new position
- [ ] Pause button stops all movement
- [ ] Play button resumes simulation
- [ ] Zoom and pan still work correctly
- [ ] Graph with 50+ nodes performs acceptably

---

## Rollback Plan

If issues arise, the changes are contained to a single file. Git revert or restore from previous commit.
