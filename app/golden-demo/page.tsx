'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoldenRatio } from "@/hooks/useGoldenRatio";

export default function GoldenDemoPage() {
  const { scale, spacing } = useGoldenRatio();

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-phi-3xl font-bold optical-balance">Golden Ratio Design System</h1>
        <p className="text-phi-lg text-muted-foreground rhythm-normal">
          Implementing LiftKit-inspired design principles
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Typography Scale</h2>
        <div className="space-y-2">
          <p className="text-phi-xs">Extra Small (φ⁻²): ~0.382rem</p>
          <p className="text-phi-sm">Small (φ⁻¹): ~0.618rem</p>
          <p className="text-phi-base">Base: 1rem</p>
          <p className="text-phi-lg">Large (φ): ~1.618rem</p>
          <p className="text-phi-xl">Extra Large (φ²): ~2.618rem</p>
          <p className="text-phi-2xl">2X Large (φ³): ~4.236rem</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="optical">Optical Button</Button>
          <Button size="phi-sm">Golden Small</Button>
          <Button size="phi-base">Golden Base</Button>
          <Button size="phi-lg">Golden Large</Button>
          <Button variant="optical" size="phi-base">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            With Icon
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard spacing and styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses the default styling with standard spacing.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="optical">
            <CardHeader golden>
              <CardTitle>Optical Card</CardTitle>
              <CardDescription>With visual corrections</CardDescription>
            </CardHeader>
            <CardContent golden>
              <p>This card applies optical corrections and hover effects.</p>
            </CardContent>
            <CardFooter golden>
              <Button variant="optical" size="phi-base">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="golden">
            <CardHeader golden>
              <CardTitle>Golden Card</CardTitle>
              <CardDescription>Pure golden ratio proportions</CardDescription>
            </CardHeader>
            <CardContent golden>
              <p>Every spacing value follows the golden ratio sequence.</p>
            </CardContent>
            <CardFooter golden>
              <Button size="phi-base">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Golden Grid Layout</h2>
        <div className="grid-phi grid-phi-2 bg-muted rounded-phi-lg p-phi-xl">
          <div className="bg-background p-phi-lg rounded-phi-md">
            <h3 className="text-phi-lg font-medium mb-phi-sm">Sidebar (1)</h3>
            <p className="text-phi-sm">This column is 1 unit wide</p>
          </div>
          <div className="bg-background p-phi-lg rounded-phi-md">
            <h3 className="text-phi-lg font-medium mb-phi-sm">Main Content (φ)</h3>
            <p className="text-phi-sm">This column is φ (1.618) units wide, creating a harmonious layout</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Spacing Demonstration</h2>
        <div className="space-y-4">
          {['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl'].map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="text-sm font-mono w-16">{size}:</span>
              <div className={`bg-primary h-4 rounded-phi-sm`} style={{ width: `var(--space-phi-${size})` }} />
              <span className="text-sm text-muted-foreground">--space-phi-{size}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-phi-2xl font-semibold">Dynamic Font Scaling</h2>
        <div className="bg-muted p-phi-xl rounded-phi-lg space-y-2">
          <p>Current viewport-based font sizes:</p>
          <ul className="space-y-1 font-mono text-sm">
            <li>Base: {scale.base.toFixed(2)}px</li>
            <li>Large: {scale.lg.toFixed(2)}px</li>
            <li>XL: {scale.xl.toFixed(2)}px</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Resize your browser to see the golden ratio scaling in action!
          </p>
        </div>
      </section>
    </div>
  );
}