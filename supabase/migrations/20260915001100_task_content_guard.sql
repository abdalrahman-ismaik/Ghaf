begin;

-- Mirror the existing JavaScript /iu instruction expressions without adding a negation policy.
-- PostgreSQL ARE word classes differ from JavaScript ASCII word boundaries and whitespace.
create function public.ghaf_task_instruction_pattern(p_pattern text) returns text
language sql immutable set search_path='' as $$
 select replace(replace(replace(p_pattern,
  '\b','(?:(?<![A-Za-z0-9_])(?=[A-Za-z0-9_])|(?<=[A-Za-z0-9_])(?![A-Za-z0-9_]))'),
  '\s','[\u0009-\u000d\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]'),
  '.','[^\n\r\u2028\u2029]');
$$;
create function public.ghaf_guard_task_content() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_template jsonb:=new.template;v_en text;v_ar text;v_en_direct text;v_ar_direct text;v_food text;
begin
 v_en_direct:=concat_ws(E'\n',v_template#>>'{title,en}',v_template#>>'{positiveAction,en}',v_template#>>'{definitionOfDone,en}');
 v_ar_direct:=concat_ws(E'\n',v_template#>>'{title,ar}',v_template#>>'{positiveAction,ar}',v_template#>>'{definitionOfDone,ar}');
 v_en:=v_en_direct||E'\n'||coalesce((select string_agg(x->>'en',E'\n') from jsonb_array_elements(v_template#>'{safety,childAllowedActions}')x),'');
 v_ar:=v_ar_direct||E'\n'||coalesce((select string_agg(x->>'ar',E'\n') from jsonb_array_elements(v_template#>'{safety,childAllowedActions}')x),'');
 -- JavaScript /iu folds these two non-ASCII characters into its ASCII word set.
 v_en:=translate(v_en,'Kſ','Ks');v_en_direct:=translate(v_en_direct,'Kſ','Ks');
 if (v_en collate "C") ~* public.ghaf_task_instruction_pattern('\b(?:carry|take|bring|move|sort|collect|gather|place|bag|dispose|throw|pick\s*up|touch|handle|repair)\b.{0,55}\b(?:glass|(?<!non-)sharps?|batter(?:y|ies)|chemicals?|medicine|unknown\s+waste|electrical\s+(?:item|wire|device))\b')
  or v_ar ~ public.ghaf_task_instruction_pattern('(?:احمل|خذ|انقل|افرز|اجمع|ضع|تخلّص|التقط|المس|تعامل|أصلح).{0,55}(?:الزجاج|أداة\s+حادّة|أدوات\s+حادّة|بطارية|بطاريات|مادة\s+كيميائية|مواد\s+كيميائية|دواء|أدوية|نفايات\s+مجهولة|عنصر\s+كهربائي)')
  or (v_en_direct collate "C") ~* public.ghaf_task_instruction_pattern('\b(?:glass|(?<!non-)sharps?|batter(?:y|ies)|chemicals?|medicine|unknown\s+waste|electrical\s+(?:item|wire|device))\b')
  or v_ar_direct ~ public.ghaf_task_instruction_pattern('(?:الزجاج|بطارية|بطاريات|مادة\s+كيميائية|مواد\s+كيميائية|دواء|أدوية|نفايات\s+مجهولة|عنصر\s+كهربائي)')
  or (v_en collate "C") ~* public.ghaf_task_instruction_pattern('\b(?:go|walk|carry|take|dispose)\b.{0,45}\b(?:alone|yourself|without\s+(?:an\s+)?adult)\b|\bcross\s+(?:a\s+)?road\b')
  or v_ar ~ public.ghaf_task_instruction_pattern('(?:اذهب|امش|احمل|خذ|تخلّص).{0,45}(?:وحدك|بنفسك|دون\s+شخص\s+بالغ)|اعبر\s+(?:ال)?طريق') then
  raise exception using errcode='PT400',message='invalid_command';
 end if;
 if v_template->>'categoryId'='food_hospitality' then
  v_food:=concat_ws(' ',v_template#>>'{title,ar}',v_template#>>'{title,en}',v_template#>>'{positiveAction,ar}',
   v_template#>>'{positiveAction,en}',v_template#>>'{definitionOfDone,ar}',v_template#>>'{definitionOfDone,en}');
  if (translate(v_food,'Kſ','Ks') collate "C") ~* public.ghaf_task_instruction_pattern('(?:clean\s*plate|finish\s+(?:all|every)|every\s+bite|calorie|diet|body\s*weight|إنهاء\s+كل\s+الطعام|الطبق\s+النظيف|السعرات|الحمية|الوزن)') then
   raise exception using errcode='PT400',message='invalid_command'; end if;
 end if;
 return new;
end; $$;
create trigger app_task_instruction_guard before insert or update of template on public.app_tasks
 for each row execute function public.ghaf_guard_task_content();
create trigger app_custom_instruction_guard before insert or update of template on public.app_custom_task_templates
 for each row execute function public.ghaf_guard_task_content();
revoke all on function public.ghaf_task_instruction_pattern(text),public.ghaf_guard_task_content() from public,anon,authenticated;
commit;
