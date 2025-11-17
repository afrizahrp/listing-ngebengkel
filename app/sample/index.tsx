import { WorkshopCard } from "@/components/WorkshopCard";
import { WorkshopDetailModal, Workshop } from "@/components/WorkshopDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sampleWorkshops: Workshop[] = [
    {
      name: "Advanced Engine Diagnostics & Repair",
      category: "Automotive",
      type: "Specialist",
      promoText: "Spring special! Book now and get 25% off plus a free diagnostic tool kit worth $150. Valid until April 15th only!",
      description: "Master modern engine diagnostics using professional scan tools, learn to interpret OBD-II codes, and perform advanced repairs on gasoline and diesel engines.",
      duration: "3 days (24 hours total)",
      schedule: "April 20-22, 2024 | 9:00 AM - 5:00 PM",
      instructor: "Mike Johnson, ASE Master Technician",
      location: "Auto Tech Training Center, Building A",
      capacity: "Maximum 12 participants",
      price: "$899 (Special: $674 with promo)",
      requirements: [
        "Basic mechanical knowledge",
        "Understanding of engine fundamentals",
        "Safety equipment (provided)",
        "Laptop or tablet for diagnostic software"
      ],
      outcomes: [
        "Read and interpret complex OBD-II diagnostic codes",
        "Use professional-grade scan tools and oscilloscopes",
        "Diagnose common and advanced engine issues",
        "Perform sensor testing and wiring diagnostics",
        "Understand fuel injection and ignition systems"
      ]
    },
    {
      name: "Electric Vehicle Maintenance Certification",
      category: "Automotive",
      type: "Specialist",
      promoText: "Limited time offer: Register this month and receive free access to our exclusive EV safety equipment course (valued at $299) plus certification materials!",
      description: "Comprehensive training on EV battery systems, high-voltage safety protocols, charging infrastructure, and specialized maintenance procedures for modern electric vehicles.",
      duration: "5 days (40 hours total)",
      schedule: "May 6-10, 2024 | 8:00 AM - 5:00 PM",
      instructor: "Dr. Sarah Chen, EV Systems Engineer",
      location: "Electric Vehicle Training Facility",
      capacity: "Maximum 10 participants",
      price: "$1,499 (includes certification exam)",
      requirements: [
        "Automotive technician certification or equivalent experience",
        "Completed safety training module (online, provided)",
        "Personal protective equipment for high-voltage work",
        "Current First Aid/CPR certification recommended"
      ],
      outcomes: [
        "Understand high-voltage battery systems and safety protocols",
        "Perform EV-specific maintenance and diagnostics",
        "Work safely with electric powertrains and components",
        "Diagnose and repair charging system issues",
        "Obtain Level 2 EV Technician Certification"
      ]
    },
    {
      name: "Professional Auto Body & Paint Workshop",
      category: "Automotive",
      type: "Specialist",
      promoText: "Group discount available! Bring 3+ colleagues and save 40% per person. Includes all materials and professional spray gun rental!",
      description: "Learn professional auto body repair techniques, dent removal, panel replacement, surface preparation, and advanced painting methods using modern spray equipment.",
      duration: "4 days (32 hours total)",
      schedule: "June 3-6, 2024 | 9:00 AM - 5:00 PM",
      instructor: "Carlos Martinez, Master Collision Repair Specialist",
      location: "Body Shop Training Center, Bay 3",
      capacity: "Maximum 8 participants",
      price: "$1,299 (Group rate: $779/person for 3+)",
      requirements: [
        "Basic hand tool knowledge",
        "Safety glasses and respirator (can be provided)",
        "Work clothes that can get dirty",
        "No prior body work experience required"
      ],
      outcomes: [
        "Master PDR (Paintless Dent Repair) techniques",
        "Perform panel alignment and replacement",
        "Prepare surfaces for professional paint application",
        "Use HVLP spray guns and paint mixing systems",
        "Apply clear coat and color matching techniques",
        "Understand modern paint systems and safety protocols"
      ]
    },
  ];

  const filteredWorkshops = useMemo(() => {
    if (!searchQuery.trim()) {
      return sampleWorkshops;
    }

    const query = searchQuery.toLowerCase();
    return sampleWorkshops.filter(
      (workshop) =>
        workshop.name.toLowerCase().includes(query) ||
        workshop.category.toLowerCase().includes(query) ||
        workshop.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCardClick = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Automotive Workshop Catalog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our specialized automotive workshops designed to enhance your skills and accelerate your career growth.
          </p>
          <Link to="/whatsapp-demo">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              View WhatsApp Chat Demo
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workshops by name, category, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Workshop Cards */}
        {filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <WorkshopCard
                key={index}
                name={workshop.name}
                category={workshop.category}
                type={workshop.type}
                promoText={workshop.promoText}
                description={workshop.description}
                onClick={() => handleCardClick(workshop)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No workshops found matching "{searchQuery}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>

      {/* Workshop Detail Modal */}
      <WorkshopDetailModal
        workshop={selectedWorkshop}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Index;
