'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Building {
  id: string;
  name: string;
  address: string;
  zip_code: string;
  neighborhood: string;
  active: boolean;
}

interface ScheduleDay {
  id: string;
  day_of_week: number;
  active: boolean;
  cutoff_hours_before: number;
}

interface BlackoutDate {
  id: string;
  blackout_date: string;
  reason: string | null;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminDeliveryPage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Building modal
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingForm, setBuildingForm] = useState({ name: '', address: '', zip_code: '', neighborhood: '' });
  const [savingBuilding, setSavingBuilding] = useState(false);

  // Blackout modal
  const [blackoutModalOpen, setBlackoutModalOpen] = useState(false);
  const [blackoutForm, setBlackoutForm] = useState({ blackout_date: '', reason: '' });
  const [savingBlackout, setSavingBlackout] = useState(false);

  const fetchData = async () => {
    try {
      const [scheduleRes, buildingsRes] = await Promise.all([
        fetch('/api/admin/delivery-schedule').then((r) => r.json()),
        fetch('/api/admin/buildings').then((r) => r.json()),
      ]);
      setSchedule(scheduleRes.schedule || []);
      setBlackoutDates(scheduleRes.blackoutDates || []);
      setBuildings(buildingsRes.buildings || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Schedule actions
  const toggleScheduleDay = async (day: ScheduleDay) => {
    await fetch('/api/admin/delivery-schedule', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: day.id, active: !day.active }),
    });
    setSchedule((prev) => prev.map((d) => (d.id === day.id ? { ...d, active: !d.active } : d)));
  };

  const updateCutoff = async (day: ScheduleDay, hours: number) => {
    if (hours < 1 || hours > 168) return;
    await fetch('/api/admin/delivery-schedule', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: day.id, cutoff_hours_before: hours }),
    });
    setSchedule((prev) => prev.map((d) => (d.id === day.id ? { ...d, cutoff_hours_before: hours } : d)));
  };

  // Blackout actions
  const openAddBlackout = () => {
    setBlackoutForm({ blackout_date: '', reason: '' });
    setBlackoutModalOpen(true);
  };

  const handleSaveBlackout = async () => {
    if (!blackoutForm.blackout_date) return;
    setSavingBlackout(true);
    try {
      const res = await fetch('/api/admin/delivery-schedule/blackout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blackoutForm),
      });
      if (res.ok) {
        setBlackoutModalOpen(false);
        fetchData();
      }
    } catch {
      // ignore
    } finally {
      setSavingBlackout(false);
    }
  };

  const deleteBlackout = async (id: string) => {
    if (!confirm('Remove this blackout date?')) return;
    await fetch(`/api/admin/delivery-schedule/blackout?id=${id}`, { method: 'DELETE' });
    setBlackoutDates((prev) => prev.filter((d) => d.id !== id));
  };

  // Building actions
  const openCreateBuilding = () => {
    setEditingBuilding(null);
    setBuildingForm({ name: '', address: '', zip_code: '', neighborhood: '' });
    setBuildingModalOpen(true);
  };

  const openEditBuilding = (b: Building) => {
    setEditingBuilding(b);
    setBuildingForm({ name: b.name, address: b.address, zip_code: b.zip_code, neighborhood: b.neighborhood || '' });
    setBuildingModalOpen(true);
  };

  const handleSaveBuilding = async () => {
    if (!buildingForm.name || !buildingForm.address || !buildingForm.zip_code) return;
    setSavingBuilding(true);
    try {
      if (editingBuilding) {
        await fetch(`/api/admin/buildings/${editingBuilding.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildingForm),
        });
      } else {
        await fetch('/api/admin/buildings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildingForm),
        });
      }
      setBuildingModalOpen(false);
      fetchData();
    } catch {
      // ignore
    } finally {
      setSavingBuilding(false);
    }
  };

  const toggleBuilding = async (b: Building) => {
    await fetch(`/api/admin/buildings/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !b.active }),
    });
    setBuildings((prev) => prev.map((bld) => (bld.id === b.id ? { ...bld, active: !bld.active } : bld)));
  };

  const deleteBuilding = async (id: string) => {
    if (!confirm('Are you sure you want to delete this building?')) return;
    await fetch(`/api/admin/buildings/${id}`, { method: 'DELETE' });
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading delivery settings...</div>;
  }

  return (
    <div>
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Delivery Settings</h1>

      {/* Delivery Schedule */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-dama-charcoal">Weekly Schedule</h2>
        <p className="mt-1 text-xs text-dama-charcoal/50">Toggle delivery days and set order cutoff times.</p>
        <div className="mt-4 divide-y divide-dama-sand rounded-lg border border-dama-sand bg-white">
          {schedule.map((day) => (
            <div key={day.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={day.active}
                  onClick={() => toggleScheduleDay(day)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${day.active ? 'bg-dama-green-500' : 'bg-dama-sand'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${day.active ? 'translate-x-4' : ''}`} />
                </button>
                <span className={`text-sm font-medium ${day.active ? 'text-dama-charcoal' : 'text-dama-charcoal/60'}`}>
                  {DAY_NAMES[day.day_of_week]}
                </span>
              </div>
              {day.active && (
                <div className="flex items-center gap-2 text-xs text-dama-charcoal/60">
                  <span>Cutoff:</span>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={day.cutoff_hours_before}
                    onChange={(e) => updateCutoff(day, Number(e.target.value))}
                    className="w-16 rounded border border-dama-sand px-2 py-1 text-xs text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
                  />
                  <span>hrs before</span>
                </div>
              )}
            </div>
          ))}
          {schedule.length === 0 && (
            <p className="p-4 text-sm text-dama-charcoal/50">No delivery schedule configured in the database.</p>
          )}
        </div>
      </section>

      {/* Blackout Dates */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dama-charcoal">Blackout Dates</h2>
            <p className="mt-1 text-xs text-dama-charcoal/50">Block specific dates from accepting orders (holidays, etc).</p>
          </div>
          <Button size="sm" onClick={openAddBlackout}>Add Date</Button>
        </div>
        <div className="mt-4 divide-y divide-dama-sand rounded-lg border border-dama-sand bg-white">
          {blackoutDates.map((bd) => (
            <div key={bd.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-dama-charcoal">
                  {new Date(bd.blackout_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {bd.reason && <p className="mt-0.5 text-xs text-dama-charcoal/50">{bd.reason}</p>}
              </div>
              <button onClick={() => deleteBlackout(bd.id)} className="text-xs font-medium text-dama-error hover:underline">
                Remove
              </button>
            </div>
          ))}
          {blackoutDates.length === 0 && (
            <p className="p-4 text-sm text-dama-charcoal/50">No upcoming blackout dates.</p>
          )}
        </div>
      </section>

      {/* Eligible Buildings */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dama-charcoal">Eligible Buildings</h2>
            <p className="mt-1 text-xs text-dama-charcoal/50">Buildings that qualify for lobby/concierge delivery.</p>
          </div>
          <Button size="sm" onClick={openCreateBuilding}>Add Building</Button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-dama-sand bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Name</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Address</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Neighborhood</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">ZIP</th>
                <th className="px-4 py-3 text-center font-medium text-dama-charcoal/60">Active</th>
                <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3 font-medium text-dama-charcoal">{b.name}</td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{b.address}</td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{b.neighborhood || '—'}</td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{b.zip_code}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={b.active}
                      onClick={() => toggleBuilding(b)}
                      className={`relative mx-auto h-5 w-9 rounded-full transition-colors ${b.active ? 'bg-dama-green-500' : 'bg-dama-sand'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${b.active ? 'translate-x-4' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditBuilding(b)} className="text-xs font-medium text-dama-green-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => deleteBuilding(b.id)} className="ml-3 text-xs font-medium text-dama-error hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {buildings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-dama-charcoal/50">No buildings added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Building Modal */}
      <Modal open={buildingModalOpen} onClose={() => setBuildingModalOpen(false)} className="max-w-lg">
        <h2 className="mb-4 text-lg font-semibold text-dama-charcoal">
          {editingBuilding ? 'Edit Building' : 'Add Building'}
        </h2>
        <div className="space-y-4">
          <Input
            id="building-name"
            label="Building Name"
            value={buildingForm.name}
            onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
          />
          <Input
            id="building-address"
            label="Address"
            value={buildingForm.address}
            onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="building-zip"
              label="ZIP Code"
              value={buildingForm.zip_code}
              onChange={(e) => setBuildingForm({ ...buildingForm, zip_code: e.target.value })}
            />
            <Input
              id="building-neighborhood"
              label="Neighborhood"
              value={buildingForm.neighborhood}
              onChange={(e) => setBuildingForm({ ...buildingForm, neighborhood: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveBuilding} disabled={savingBuilding}>
              {savingBuilding ? 'Saving...' : editingBuilding ? 'Update' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={() => setBuildingModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Blackout Date Modal */}
      <Modal open={blackoutModalOpen} onClose={() => setBlackoutModalOpen(false)} className="max-w-sm">
        <h2 className="mb-4 text-lg font-semibold text-dama-charcoal">Add Blackout Date</h2>
        <div className="space-y-4">
          <Input
            id="blackout-date"
            label="Date"
            type="date"
            value={blackoutForm.blackout_date}
            onChange={(e) => setBlackoutForm({ ...blackoutForm, blackout_date: e.target.value })}
          />
          <Input
            id="blackout-reason"
            label="Reason (optional)"
            value={blackoutForm.reason}
            onChange={(e) => setBlackoutForm({ ...blackoutForm, reason: e.target.value })}
          />
          <div className="flex gap-3">
            <Button onClick={handleSaveBlackout} disabled={savingBlackout}>
              {savingBlackout ? 'Saving...' : 'Add Blackout Date'}
            </Button>
            <Button variant="ghost" onClick={() => setBlackoutModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
