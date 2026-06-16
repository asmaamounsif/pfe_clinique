<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark appointments as reminder sent (rappel_envoye) 24h before';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $start = Carbon::now()->addDay()->startOfDay();
        $end = Carbon::now()->addDay()->endOfDay();

        $appointments = Appointment::whereBetween('date_heure', [$start, $end])
            ->where('rappel_envoye', false)
            ->where('status', '!=', 'Annulé')
            ->get();

        $this->info('Found '. $appointments->count() .' appointments to mark as reminder sent.');

        foreach ($appointments as $appointment) {
            // Here you could dispatch notifications (email/SMS)
            $appointment->rappel_envoye = true;
            $appointment->save();
            $this->info('Marked appointment #'.$appointment->id.' as rappel_envoye');
        }

        $this->info('Done.');
        return 0;
    }
}
